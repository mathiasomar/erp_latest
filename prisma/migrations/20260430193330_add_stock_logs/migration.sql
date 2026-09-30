-- CreateEnum
CREATE TYPE "StockAdjustmentReason" AS ENUM ('RESTOCK', 'MANUAL_INCREASE', 'MANUAL_DECREASE', 'DAMAGED', 'RETURNED', 'EXPIRED');

-- CreateTable
CREATE TABLE "StockLog" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reason" "StockAdjustmentReason" NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockLog" ADD CONSTRAINT "StockLog_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
