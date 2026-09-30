/*
  Warnings:

  - You are about to drop the column `userIp` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `branchStockId` on the `StockLog` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `StockLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,branchId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,branchId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,branchId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderNumber,branchId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku,branchId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branchId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'BRANCH_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'BRANCH_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'BRANCH_USER_ASSIGNED';
ALTER TYPE "ActivityAction" ADD VALUE 'CUSTOMER_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'CUSTOMER_UPDATED';

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_phone_key";

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- DropIndex
DROP INDEX "Product_barcode_key";

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "userIp",
ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockLog" DROP COLUMN "branchStockId",
DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "branchId" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_branchId_key" ON "Category"("name", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_branchId_key" ON "Customer"("phone", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_branchId_key" ON "Customer"("email", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_branchId_key" ON "Order"("orderNumber", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_branchId_key" ON "Product"("sku", "branchId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
