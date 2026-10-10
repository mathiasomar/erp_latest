"use server";

import prisma from "@/lib/prisma";
import { requireBranchContext } from "@/lib/branch-context";
import { serializeProduct } from "@/lib/product-serialization";

export const getProductByBarcode = async (barcode: string) => {
  const ctx = await requireBranchContext();

  const product = await prisma.product.findFirst({
    where: {
      barcode: barcode.trim(),
      branchId: ctx.branchId,
      isActive: true,
    },
    include: {
      category: true,
      stock: true,
    },
  });

  return { product: product ? serializeProduct(product) : null };
};
