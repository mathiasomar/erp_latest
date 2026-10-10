import { NextResponse } from "next/server";

export const GET = () => {
  const headers = [
    "name",
    "sku",
    "barcode",
    "qrCode",
    "batchNumber",
    "expiryDate",
    "unit",
    "brand",
    "price",
    "lastPrice",
    "costPrice",
    "category",
    "quantity",
    "lowStockAt",
    "isActive",
    "discountRate",
    "taxRate",
    "imageUrl",
  ].join(",");

  const example = [
    "Maize Flour 2kg",
    "MF-2KG-001",
    "6001234567890",
    "",
    "BATCH-001",
    "2027-12-31",
    "bag",
    "Acme",
    "180",
    "160",
    "120",
    "Flour",
    "50",
    "10",
    "true",
    "0",
    "16",
    "",
  ].join(",");

  const csv = `${headers}\n${example}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="product-import-template.csv"',
    },
  });
};
