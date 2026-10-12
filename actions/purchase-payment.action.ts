"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireBranchContext } from "@/lib/branch-context";
import { logActivity } from "@/lib/activity-logger";
import { ActivityAction } from "@/generated/prisma/enums";
import { D, money, serialize } from "@/lib/money";

const purchasePaymentSchema = z.object({
  purchaseId: z.string(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["CASH", "MPESA", "CARD", "BANK_TRANSFER"]),
  reference: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type PurchasePaymentValues = z.infer<typeof purchasePaymentSchema>;

export type PurchasePaymentResult = 
  | { success: true; payment: { id: string; amount: number; method: string; purchaseId: string } }
  | { success: false; error: string | Record<string, string[]> };

export const createPurchasePayment = async (values: PurchasePaymentValues): Promise<PurchasePaymentResult> => {
  const ctx = await requireBranchContext();
  const parsed = purchasePaymentSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // Get the purchase to check balance
  const purchase = await prisma.purchase.findUnique({
    where: { id: parsed.data.purchaseId, branchId: ctx.branchId },
  });

  if (!purchase) {
    return { success: false, error: { purchaseId: ["Purchase not found"] } };
  }

  if (purchase.status === "CANCELLED") {
    return { success: false, error: { purchaseId: ["Cannot pay for cancelled purchase"] } };
  }

  // Calculate total paid so far
  const existingPayments = await prisma.purchasePayment.findMany({
    where: { purchaseId: parsed.data.purchaseId },
  });
  const totalPaid = money(
    existingPayments.reduce((sum, payment) => sum.plus(payment.amount), D(0)),
  ).toNumber();
  const newTotalPaid = money(D(totalPaid).plus(parsed.data.amount)).toNumber();

  if (newTotalPaid > purchase.total) {
    return { 
      success: false, 
      error: { amount: [`Payment exceeds balance. Remaining: KES ${(purchase.total - totalPaid).toFixed(2)}`] } 
    };
  }

  // Create payment
  const payment = await prisma.purchasePayment.create({
    data: {
      ...parsed.data,
      reference: parsed.data.reference || null,
      note: parsed.data.note || null,
    },
    select: {
      id: true,
      amount: true,
      method: true,
      purchaseId: true,
    },
  });

  // Update purchase payment status
  let newPaymentStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
  if (newTotalPaid >= purchase.total) {
    newPaymentStatus = "PAID";
  } else if (newTotalPaid > 0) {
    newPaymentStatus = "PARTIAL";
  }

  await prisma.purchase.update({
    where: { id: parsed.data.purchaseId },
    data: {
      paymentStatus: newPaymentStatus,
      balanceDue: money(D(purchase.total).minus(newTotalPaid)).toNumber(),
    },
  });

  await logActivity({
    action: ActivityAction.PURCHASE_CREATED, // Using existing action, could add new one
    entity: "PurchasePayment",
    entityId: payment.id,
    entityLabel: `Payment for ${purchase.purchaseNumber}`,
    userId: ctx.userId,
    branchId: ctx.branchId,
    meta: { amount: parsed.data.amount, method: parsed.data.method },
  });

  revalidatePath("/dashboard/purchases");
  return serialize({ success: true, payment });
};

export const deletePurchasePayment = async (id: string): Promise<PurchasePaymentResult> => {
  const ctx = await requireBranchContext();

  const payment = await prisma.purchasePayment.findUnique({
    where: { id },
    select: {
      id: true,
      amount: true,
      method: true,
      purchaseId: true,
      purchase: {
        select: {
          id: true,
          total: true,
          branchId: true,
        },
      },
    },
  });

  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  if (payment.purchase.branchId !== ctx.branchId) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.purchasePayment.delete({ where: { id } });

  // Recalculate purchase payment status
  const remainingPayments = await prisma.purchasePayment.findMany({
    where: { purchaseId: payment.purchaseId },
  });
  const totalPaid = money(
    remainingPayments.reduce((sum, remainingPayment) => sum.plus(remainingPayment.amount), D(0)),
  ).toNumber();

  let newPaymentStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
  if (totalPaid >= payment.purchase.total) {
    newPaymentStatus = "PAID";
  } else if (totalPaid > 0) {
    newPaymentStatus = "PARTIAL";
  }

  await prisma.purchase.update({
    where: { id: payment.purchaseId },
    data: {
      paymentStatus: newPaymentStatus,
      balanceDue: money(D(payment.purchase.total).minus(totalPaid)).toNumber(),
    },
  });

  revalidatePath("/dashboard/purchases");
  return serialize({
    success: true,
    payment: {
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      purchaseId: payment.purchaseId,
    },
  });
};
