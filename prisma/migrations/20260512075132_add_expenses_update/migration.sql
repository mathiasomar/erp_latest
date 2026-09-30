/*
  Warnings:

  - You are about to drop the column `description` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `expense` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `date` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpensePaymentMethod" AS ENUM ('CASH', 'MPESA', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "ExpenseFrequency" AS ENUM ('ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "description",
DROP COLUMN "expense",
DROP COLUMN "updateAt",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "frequency" "ExpenseFrequency" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paymentMethod" "ExpensePaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
