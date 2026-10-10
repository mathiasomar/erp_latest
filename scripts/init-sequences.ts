import { DocumentType } from "@/generated/prisma/client";
import prisma from "../lib/prisma";

const sources: Partial<Record<DocumentType, (b: string) => Promise<string[]>>> =
  {
    ORDER: async (b) =>
      (
        await prisma.order.findMany({
          where: { branchId: b },
          select: { orderNumber: true },
        })
      ).map((r) => r.orderNumber),
    RECEIPT: async (b) =>
      (
        await prisma.receipt.findMany({
          where: { branchId: b },
          select: { receiptNumber: true },
        })
      ).map((r) => r.receiptNumber),
    LAYAWAY: async (b) =>
      (
        await prisma.layaway.findMany({
          where: { branchId: b },
          select: { orderNumber: true },
        })
      ).map((r) => r.orderNumber),
    PURCHASE: async (b) =>
      (
        await prisma.purchase.findMany({
          where: { branchId: b },
          select: { purchaseNumber: true },
        })
      ).map((r) => r.purchaseNumber),
    JOURNAL_ENTRY: async (b) =>
      (
        await prisma.journalEntry.findMany({
          where: { branchId: b },
          select: { entryNumber: true },
        })
      ).map((r) => r.entryNumber),
  };

async function main() {
  const branches = await prisma.branch.findMany({ select: { id: true } });
  for (const b of branches) {
    for (const [type, load] of Object.entries(sources)) {
      const numbers = await load!(b.id);
      const max = numbers.reduce(
        (m, n) => Math.max(m, Number(n.match(/(\d+)$/)?.[1] ?? 0)),
        0,
      );
      await prisma.documentSequence.upsert({
        where: {
          type_branchId_year: {
            type: type as DocumentType,
            branchId: b.id,
            year: 0,
          },
        },
        create: {
          type: type as DocumentType,
          branchId: b.id,
          year: 0,
          nextNumber: max + 1,
        },
        update: { nextNumber: max + 1 },
      });
    }
  }
}
main().finally(() => prisma.$disconnect());
