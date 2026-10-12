import prisma from "@/lib/prisma";
import { serialize } from "@/lib/money";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: { items: true },
        },
        splitPayments: true,
      },
    });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(serialize(payment));
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch payment" },
      { status: 500 },
    );
  }
}
