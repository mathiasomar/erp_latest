-- CreateEnum
CREATE TYPE "LayawayStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Layaway" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "balanceAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "LayawayStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayawayItem" (
    "id" TEXT NOT NULL,
    "layawayId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LayawayItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayawayPayment" (
    "id" TEXT NOT NULL,
    "layawayId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "mpesaRef" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LayawayPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Layaway" ADD CONSTRAINT "Layaway_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layaway" ADD CONSTRAINT "Layaway_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layaway" ADD CONSTRAINT "Layaway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayawayItem" ADD CONSTRAINT "LayawayItem_layawayId_fkey" FOREIGN KEY ("layawayId") REFERENCES "Layaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayawayItem" ADD CONSTRAINT "LayawayItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayawayPayment" ADD CONSTRAINT "LayawayPayment_layawayId_fkey" FOREIGN KEY ("layawayId") REFERENCES "Layaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
