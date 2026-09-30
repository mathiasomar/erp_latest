-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_branchId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
