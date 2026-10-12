import { Prisma } from "@/generated/prisma/client";

type Decimalish = Prisma.Decimal | number | string | null | undefined;

/** Use for all money math: D(a).plus(b).times(c) */
export const D = (v: Decimalish) => new Prisma.Decimal(v ?? 0);

/** Round to 2 dp (half-up) */
export const money = (v: Decimalish) =>
  D(v).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

export const toNum = (v: Decimalish) => D(v).toNumber();

export type Serialized<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
    ? T
    : T extends (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

/** Converts Decimals → numbers (deep) so data is safe for client components & JSON */
export function serialize<const T>(value: T): Serialized<T> {
  if (value === null || value === undefined) return value as Serialized<T>;
  if (Prisma.Decimal.isDecimal(value)) {
    return (value as Prisma.Decimal).toNumber() as Serialized<T>;
  }
  if (value instanceof Date) return value as Serialized<T>;
  if (Array.isArray(value)) return value.map(serialize) as Serialized<T>;
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as object).map(([key, entry]) => [
        key,
        serialize(entry),
      ]),
    ) as Serialized<T>;
  }
  return value as Serialized<T>;
}
