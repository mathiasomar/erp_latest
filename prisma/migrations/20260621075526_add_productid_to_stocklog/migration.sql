/*
  Warnings:

  - Added the required column `productId` to the `StockLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockLog" ADD COLUMN     "productId" TEXT NOT NULL;
