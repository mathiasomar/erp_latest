/*
  Warnings:

  - You are about to alter the column `unitPrice` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `discount` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `taxRate` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `total` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `costPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `discountRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `taxRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `lastPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `costPriceInclTax` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `purchaseTaxRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `unitCostExcl` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `unitCostIncl` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `taxRate` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `taxAmount` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `subtotal` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `total` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,4)`.
  - You are about to alter the column `unitPrice` on the `QuotationItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `discount` on the `QuotationItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `taxRate` on the `QuotationItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `total` on the `QuotationItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `SalesOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `discount` on the `SalesOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `taxRate` on the `SalesOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `total` on the `SalesOrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "costPrice" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "discountRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "lastPrice" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "costPriceInclTax" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "purchaseTaxRate" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "PurchaseItem" ALTER COLUMN "unitCostExcl" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "unitCostIncl" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(14,4);

-- AlterTable
ALTER TABLE "QuotationItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SalesOrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);
