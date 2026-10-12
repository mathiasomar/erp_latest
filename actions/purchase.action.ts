"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireBranchContext } from "@/lib/branch-context";
import { logActivity } from "@/lib/activity-logger";
import { ActivityAction } from "@/generated/prisma/enums";
import { D, money, serialize } from "@/lib/money";
import { nextDocumentNumber } from "@/lib/doc-number";

// ── Helpers ───────────────────────────────────────────────────────────────────

const generatePurchaseNumber = async (branchId: string): Promise<string> => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true },
  });
  const count = await prisma.purchase.count({ where: { branchId } });
  const prefix = branch?.code?.slice(0, 4).toUpperCase() ?? "PO";
  return `${prefix}-PO-${String(count + 1).padStart(5, "0")}`;
};

// ── Item schema ───────────────────────────────────────────────────────────────

const purchaseItemSchema = z
  .object({
    productId: z.string().optional(),
    productName: z.string().optional(),
    sku: z.string().optional(),
    orderedQty: z.number().int().min(1),
    unitCostExcl: z.number().min(0), // cost excluding tax
    taxRate: z.number().min(0).max(100),
    updateCostPrice: z.boolean(),
  })
  .refine(
    (data) => {
      // Either productId should be set, or both productName and sku should be set
      if (data.productId) return true;
      return !!(data.productName && data.sku);
    },
    {
      message: "Either select a product or provide product name and SKU",
    },
  );

// ── Purchase schema ───────────────────────────────────────────────────────────

const purchaseSchema = z.object({
  supplierId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  expectedDate: z.string().optional(),
  paymentMethod: z.enum(["CASH", "MPESA", "CARD", "BANK_TRANSFER"]).optional(),
  discountAmount: z.number().min(0),
  shippingCost: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least one item required"),
});

export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;

// ── Compute item financials ───────────────────────────────────────────────────

const computeItem = (item: PurchaseItemInput) => {
  const taxRate = D(item.taxRate).div(100);
  const unitCostExcl = D(item.unitCostExcl);
  const unitCostIncl = money(unitCostExcl.times(D(1).plus(taxRate))).toNumber();
  const taxAmount = money(
    unitCostExcl.times(taxRate).times(item.orderedQty),
  ).toNumber();
  const subtotal = money(unitCostExcl.times(item.orderedQty)).toNumber();
  const total = money(D(unitCostIncl).times(item.orderedQty)).toNumber();
  return { unitCostIncl, taxAmount, subtotal, total };
};

// ── Create purchase (draft) ───────────────────────────────────────────────────

export const createPurchase = async (input: PurchaseInput) => {
  const ctx = await requireBranchContext();
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { items, discountAmount, shippingCost, ...orderData } = parsed.data;

  const purchaseNumber = await generatePurchaseNumber(ctx.branchId);

  const { purchase, createdProducts, itemCount, total } =
    await prisma.$transaction(async (tx) => {
      const createdProducts: {
        id: string;
        name: string;
        sku: string;
      }[] = [];
      const itemsWithProducts = [];

      // Resolve existing products or create them within the purchase transaction.
      for (const item of items) {
        if (item.productId) {
          itemsWithProducts.push({ ...item, productId: item.productId });
          continue;
        }

        if (!item.productName || !item.sku) {
          itemsWithProducts.push(item);
          continue;
        }

        const existingProduct = await tx.product.findFirst({
          where: {
            sku: item.sku,
            branchId: ctx.branchId,
          },
        });

        if (existingProduct) {
          itemsWithProducts.push({ ...item, productId: existingProduct.id });
          continue;
        }

        const newProduct = await tx.product.create({
          data: {
            name: item.productName,
            sku: item.sku,
            price: money(D(item.unitCostExcl).times(1.5)).toNumber(),
            costPrice: item.unitCostExcl,
            costPriceInclTax: money(
              D(item.unitCostExcl).times(D(1).plus(D(item.taxRate).div(100))),
            ).toNumber(),
            purchaseTaxRate: item.taxRate,
            branchId: ctx.branchId,
            stock: {
              create: {
                quantity: 0,
                lowStockAt: 10,
                branchId: ctx.branchId,
              },
            },
          },
        });

        createdProducts.push({
          id: newProduct.id,
          name: newProduct.name,
          sku: newProduct.sku,
        });
        itemsWithProducts.push({ ...item, productId: newProduct.id });
      }

      const computedItems = itemsWithProducts.map((item) => ({
        ...item,
        ...computeItem(item),
      }));

      const subtotal = money(
        computedItems.reduce(
          (sum, item) => sum.plus(D(item.subtotal)),
          D(0),
        ),
      ).toNumber();
      const taxAmount = money(
        computedItems.reduce(
          (sum, item) => sum.plus(D(item.taxAmount)),
          D(0),
        ),
      ).toNumber();
      const total = money(
        D(subtotal)
          .plus(taxAmount)
          .plus(shippingCost ?? 0)
          .minus(discountAmount ?? 0),
      ).toNumber();

      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          branchId: ctx.branchId,
          userId: ctx.userId,
          status: "DRAFT",
          paymentStatus: "UNPAID",
          supplierId: orderData.supplierId || null,
          invoiceNumber: orderData.invoiceNumber || null,
          invoiceDate: orderData.invoiceDate
            ? new Date(orderData.invoiceDate)
            : null,
          expectedDate: orderData.expectedDate
            ? new Date(orderData.expectedDate)
            : null,
          paymentMethod: orderData.paymentMethod || null,
          notes: orderData.notes || null,
          discountAmount: money(discountAmount ?? 0).toNumber(),
          shippingCost: shippingCost ?? 0,
          subtotal,
          taxAmount,
          total,
          balanceDue: total,
          items: {
            create: computedItems.map((item) => ({
              productId: item.productId!,
              productName: item.productName || "",
              sku: item.sku || "",
              orderedQty: item.orderedQty,
              receivedQty: 0,
              unitCostExcl: item.unitCostExcl,
              unitCostIncl: item.unitCostIncl,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              subtotal: item.subtotal,
              total: item.total,
              updateCostPrice: item.updateCostPrice,
            })),
          },
        },
        include: { items: true, supplier: true },
      });

      await nextDocumentNumber(tx, "PURCHASE", ctx.branchId);

      return {
        purchase,
        createdProducts,
        itemCount: computedItems.length,
        total,
      };
    });

  for (const product of createdProducts) {
    await logActivity({
      action: ActivityAction.PRODUCT_CREATED,
      entity: "Product",
      entityId: product.id,
      entityLabel: product.name,
      userId: ctx.userId,
      branchId: ctx.branchId,
      meta: { sku: product.sku, autoCreated: true },
    });
  }

  await logActivity({
    action: ActivityAction.PURCHASE_CREATED,
    entity: "Purchase",
    entityId: purchase.id,
    entityLabel: purchase.purchaseNumber,
    userId: ctx.userId,
    branchId: ctx.branchId,
    meta: { total, items: itemCount },
  });

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/products");
  return serialize({ success: true, purchase });
};

// ── Receive inventory (by invoice) ───────────────────────────────────────────
// receiveItems: array of { purchaseItemId, receivedQty }
// This is the "receive inventory by invoice" feature

const receiveSchema = z.object({
  purchaseId: z.string(),
  items: z.array(
    z.object({
      purchaseItemId: z.string(),
      receivedQty: z.number().int().min(0),
    }),
  ),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  notes: z.string().optional(),
});

export type ReceiveInventoryInput = z.infer<typeof receiveSchema>;

export const receiveInventory = async (input: ReceiveInventoryInput) => {
  const ctx = await requireBranchContext();
  const parsed = receiveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { purchaseId, items, invoiceNumber, invoiceDate, notes } = parsed.data;

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId, branchId: ctx.branchId },
    include: { items: { include: { product: true } } },
  });

  if (!purchase) return { success: false, error: "Purchase not found" };
  if (purchase.status === "CANCELLED") {
    return { success: false, error: "Cannot receive a cancelled purchase" };
  }
  if (purchase.status === "RECEIVED") {
    return { success: false, error: "Purchase already fully received" };
  }

  await prisma.$transaction(async (tx) => {
    for (const receiveItem of items) {
      if (receiveItem.receivedQty === 0) continue;

      const purchaseItem = purchase.items.find(
        (i) => i.id === receiveItem.purchaseItemId,
      );
      if (!purchaseItem) continue;

      const canReceive = purchaseItem.orderedQty - purchaseItem.receivedQty;
      const qty = Math.min(receiveItem.receivedQty, canReceive);
      if (qty <= 0) continue;

      // ── Update received qty on purchase item ──────────────────────────────
      await tx.purchaseItem.update({
        where: { id: purchaseItem.id },
        data: { receivedQty: { increment: qty } },
      });

      // ── Update stock ──────────────────────────────────────────────────────
      if (purchaseItem.productId) {
        const stock = await tx.stock.findUnique({
          where: { productId: purchaseItem.productId },
        });

        if (stock) {
          const before = stock.quantity;
          const after = before + qty;

          await tx.stock.update({
            where: { productId: purchaseItem.productId },
            data: { quantity: { increment: qty } },
          });

          // Log the stock movement
          await tx.stockLog.create({
            data: {
              stockId: stock.id,
              productId: purchaseItem.productId,
              reason: "PURCHASE_RECEIVED",
              quantityBefore: before,
              quantityAfter: after,
              change: qty,
              note: `Received via ${purchase.purchaseNumber}${
                invoiceNumber ? ` / Invoice ${invoiceNumber}` : ""
              }`,
            },
          });

          // ── Update product cost price if flagged ────────────────────────
          if (purchaseItem.updateCostPrice) {
            await tx.product.update({
              where: { id: purchaseItem.productId },
              data: {
                costPrice: purchaseItem.unitCostExcl,
                costPriceInclTax: purchaseItem.unitCostIncl,
                purchaseTaxRate: purchaseItem.taxRate,
              },
            });
          }
        }
      }
    }

    // ── Determine new purchase status ─────────────────────────────────────
    // Re-fetch updated items
    const updatedItems = await tx.purchaseItem.findMany({
      where: { purchaseId },
    });

    const allReceived = updatedItems.every(
      (i) => i.receivedQty >= i.orderedQty,
    );
    const anyReceived = updatedItems.some((i) => i.receivedQty > 0);
    const newStatus = allReceived
      ? "RECEIVED"
      : anyReceived
        ? "PARTIAL"
        : "ORDERED";

    await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: newStatus,
        receivedDate: allReceived ? new Date() : undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
        notes: notes || undefined,
      },
    });
  });

  await logActivity({
    action: ActivityAction.PURCHASE_RECEIVED,
    entity: "Purchase",
    entityId: purchaseId,
    entityLabel: purchase.purchaseNumber,
    userId: ctx.userId,
    branchId: ctx.branchId,
    meta: { invoiceNumber: invoiceNumber ?? null, items: items.length },
  });

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  return { success: true };
};

// ── Add payment to purchase ───────────────────────────────────────────────────

export const addPurchasePayment = async (
  purchaseId: string,
  amount: number,
  method: "CASH" | "MPESA" | "CARD" | "BANK_TRANSFER",
  reference?: string,
  note?: string,
) => {
  const ctx = await requireBranchContext();

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId, branchId: ctx.branchId },
  });
  if (!purchase) return { success: false, error: "Purchase not found" };

  const newAmountPaid = money(D(purchase.amountPaid).plus(amount)).toNumber();
  const newBalance = money(D(purchase.total).minus(newAmountPaid)).toNumber();
  const paymentStatus =
    newBalance <= 0 ? "PAID" : newAmountPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.$transaction([
    prisma.purchasePayment.create({
      data: {
        purchaseId,
        amount,
        method,
        reference: reference || null,
        note: note || null,
      },
    }),
    prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: Math.max(0, newBalance),
        paymentStatus,
        paymentMethod: method,
      },
    }),
  ]);

  revalidatePath("/dashboard/purchases");
  return { success: true };
};

// ── Cancel purchase ───────────────────────────────────────────────────────────

export const cancelPurchase = async (id: string) => {
  const ctx = await requireBranchContext();

  const purchase = await prisma.purchase.findUnique({
    where: { id, branchId: ctx.branchId },
  });
  if (!purchase) return { success: false, error: "Purchase not found" };
  if (purchase.status === "RECEIVED") {
    return { success: false, error: "Cannot cancel a received purchase" };
  }

  await prisma.purchase.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await logActivity({
    action: ActivityAction.PURCHASE_CANCELLED,
    entity: "Purchase",
    entityId: id,
    entityLabel: purchase.purchaseNumber,
    userId: ctx.userId,
    branchId: ctx.branchId,
  });

  revalidatePath("/dashboard/purchases");
  return { success: true };
};
