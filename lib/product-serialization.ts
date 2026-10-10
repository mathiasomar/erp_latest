type DecimalValue = { toNumber(): number };

type DecimalProductFields = {
  price: DecimalValue;
  lastPrice: DecimalValue;
  costPrice: DecimalValue;
  costPriceInclTax: DecimalValue;
  purchaseTaxRate: DecimalValue;
  discountRate: DecimalValue;
  taxRate: DecimalValue;
};

export function serializeProduct<T extends DecimalProductFields>(product: T) {
  return {
    ...product,
    price: product.price.toNumber(),
    lastPrice: product.lastPrice.toNumber(),
    costPrice: product.costPrice.toNumber(),
    costPriceInclTax: product.costPriceInclTax.toNumber(),
    purchaseTaxRate: product.purchaseTaxRate.toNumber(),
    discountRate: product.discountRate.toNumber(),
    taxRate: product.taxRate.toNumber(),
  };
}
