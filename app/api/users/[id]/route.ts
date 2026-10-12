import prisma from "@/lib/prisma";
import { serialize } from "@/lib/money";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            expenses: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(serialize(user));
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
};
