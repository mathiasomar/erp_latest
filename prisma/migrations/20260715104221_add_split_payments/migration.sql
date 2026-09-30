/*
  Warnings:

  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mpesaPhone` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mpesaRef` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
DROP COLUMN "mpesaPhone",
DROP COLUMN "mpesaRef";

-- CreateTable
CREATE TABLE "SplitPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mpesaRef" TEXT,
    "mpesaPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SplitPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SplitPayment" ADD CONSTRAINT "SplitPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
