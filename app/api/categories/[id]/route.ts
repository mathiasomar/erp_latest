import prisma from "@/lib/prisma";
import { serialize } from "@/lib/money";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(serialize(category));
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}
