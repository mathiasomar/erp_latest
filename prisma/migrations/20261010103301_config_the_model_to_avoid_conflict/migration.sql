/*
  Warnings:

  - You are about to drop the column `branchId` on the `Accounting` table. All the data in the column will be lost.
  - You are about to drop the `APPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ARPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountsPayable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountsReceivable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssetMaintenance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Accounting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assetCode,branchId]` on the table `FixedAsset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku,barcode,branchId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Made the column `branchId` on table `DeliveryNote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `FixedAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Quotation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `SalesOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `SalesReturn` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ORDER', 'RECEIPT', 'LAYAWAY', 'PURCHASE', 'GRN', 'QUOTATION', 'SALES_ORDER', 'DELIVERY_NOTE', 'INVOICE', 'SALES_RETURN', 'STOCK_TRANSFER', 'JOURNAL_ENTRY', 'FIXED_ASSET');

-- DropForeignKey
ALTER TABLE "APPayment" DROP CONSTRAINT "APPayment_apId_fkey";

-- DropForeignKey
ALTER TABLE "ARPayment" DROP CONSTRAINT "ARPayment_arId_fkey";

-- DropForeignKey
ALTER TABLE "Accounting" DROP CONSTRAINT "Accounting_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsPayable" DROP CONSTRAINT "AccountsPayable_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsPayable" DROP CONSTRAINT "AccountsPayable_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsReceivable" DROP CONSTRAINT "AccountsReceivable_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsReceivable" DROP CONSTRAINT "AccountsReceivable_customerId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsReceivable" DROP CONSTRAINT "AccountsReceivable_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AssetMaintenance" DROP CONSTRAINT "AssetMaintenance_assetId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryNote" DROP CONSTRAINT "DeliveryNote_branchId_fkey";

-- DropForeignKey
ALTER TABLE "FixedAsset" DROP CONSTRAINT "FixedAsset_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_branchId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Quotation" DROP CONSTRAINT "Quotation_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SalesOrder" DROP CONSTRAINT "SalesOrder_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturn" DROP CONSTRAINT "SalesReturn_branchId_fkey";

-- DropIndex
DROP INDEX "Accounting_code_branchId_key";

-- DropIndex
DROP INDEX "FixedAsset_assetCode_key";

-- DropIndex
DROP INDEX "Product_barcode_key";

-- DropIndex
DROP INDEX "Product_sku_branchId_key";

-- AlterTable
ALTER TABLE "Accounting" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "DeliveryNote" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "FixedAsset" ADD COLUMN     "assignedToId" TEXT,
ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Quotation" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SalesOrder" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SalesReturn" ALTER COLUMN "branchId" SET NOT NULL;

-- DropTable
DROP TABLE "APPayment";

-- DropTable
DROP TABLE "ARPayment";

-- DropTable
DROP TABLE "AccountsPayable";

-- DropTable
DROP TABLE "AccountsReceivable";

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "AssetMaintenance";

-- CreateTable
CREATE TABLE "FixedAssetMaintenance" (
    "id" TEXT NOT NULL,
    "fixedAssetId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedAssetMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "branchId" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 0,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_type_branchId_year_key" ON "DocumentSequence"("type", "branchId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Accounting_code_key" ON "Accounting"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAsset_assetCode_branchId_key" ON "FixedAsset"("assetCode", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_barcode_branchId_key" ON "Product"("sku", "barcode", "branchId");

-- AddForeignKey
ALTER TABLE "StockLog" ADD CONSTRAINT "StockLog_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNote" ADD CONSTRAINT "DeliveryNote_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedAssetMaintenance" ADD CONSTRAINT "FixedAssetMaintenance_fixedAssetId_fkey" FOREIGN KEY ("fixedAssetId") REFERENCES "FixedAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSequence" ADD CONSTRAINT "DocumentSequence_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
