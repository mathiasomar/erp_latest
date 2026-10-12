import { resolveBranchContext } from "@/lib/branch-context";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "@/lib/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;

    const ctx = await resolveBranchContext();
    if (!ctx)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        branchId: ctx.branchId,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } },
            { qrCode: { contains: search, mode: "insensitive" } },
            { batchNumber: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: { category: true, stock: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(serialize(products));
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
