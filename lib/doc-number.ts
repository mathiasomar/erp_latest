import { Prisma, DocumentType } from "@/generated/prisma/client";

const DOC_CONFIG: Record<
  DocumentType,
  { prefix: string; padding: number; resetYearly: boolean }
> = {
  ORDER: { prefix: "ORD", padding: 5, resetYearly: false },
  RECEIPT: { prefix: "RCP", padding: 5, resetYearly: false },
  LAYAWAY: { prefix: "LAY", padding: 5, resetYearly: false },
  PURCHASE: { prefix: "PUR", padding: 5, resetYearly: false },
  GRN: { prefix: "GRN", padding: 5, resetYearly: false },
  QUOTATION: { prefix: "QUO", padding: 5, resetYearly: false },
  SALES_ORDER: { prefix: "SO", padding: 5, resetYearly: false },
  DELIVERY_NOTE: { prefix: "DN", padding: 5, resetYearly: false },
  INVOICE: { prefix: "INV", padding: 5, resetYearly: false },
  SALES_RETURN: { prefix: "SR", padding: 5, resetYearly: false },
  STOCK_TRANSFER: { prefix: "TRF", padding: 5, resetYearly: false },
  JOURNAL_ENTRY: { prefix: "JE", padding: 5, resetYearly: false },
  FIXED_ASSET: { prefix: "FA", padding: 4, resetYearly: false },
};

/** Call ONLY inside prisma.$transaction, passing the tx client. */
export async function nextDocumentNumber(
  tx: Prisma.TransactionClient,
  type: DocumentType,
  branchId: string,
): Promise<string> {
  const { prefix, padding, resetYearly } = DOC_CONFIG[type];
  const year = resetYearly ? new Date().getFullYear() : 0;

  const seq = await tx.documentSequence.upsert({
    where: { type_branchId_year: { type, branchId, year } },
    create: { type, branchId, year, nextNumber: 2 },
    update: { nextNumber: { increment: 1 } },
  });

  const n = String(seq.nextNumber - 1).padStart(padding, "0");
  return resetYearly ? `${prefix}-${year}-${n}` : `${prefix}-${n}`;
}
