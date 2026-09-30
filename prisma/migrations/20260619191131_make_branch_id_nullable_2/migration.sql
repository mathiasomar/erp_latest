-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_branchId_fkey";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
