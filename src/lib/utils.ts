import { clsx, type ClassValue } from "clsx"
import type { ProductPricingItem } from "@/types/product.types"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Safely coerce an unknown value to a finite number.
 * Guards against undefined, null, and NaN.
 */
export function safePrice(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Get the price for a specific tier code from a productPricing array.
 * Returns 0 when the tier is not found or the array is absent.
 */
export function getTierPrice(
  pricing: ProductPricingItem[] | undefined | null,
  tierCode: string,
): number {
  if (!pricing || !Array.isArray(pricing)) return 0;
  const tier = pricing.find((t) => t.tierCode === tierCode);
  return tier ? safePrice(tier.price) : 0;
};

export function formatPromoValue(type: string, value: number, maxDiscount?: number | null): string {
  if (type === "DISCOUNT_FIXED") {
    return `Potongan Rp ${value.toLocaleString("id-ID")}`;
  } else if (type === "DISCOUNT_PERCENT") {
    return `Diskon ${value}%${maxDiscount ? ` (Maks Rp ${maxDiscount.toLocaleString("id-ID")})` : ""}`;
  } else if (type === "CASHBACK_FIXED") {
    return `Cashback Rp ${value.toLocaleString("id-ID")}`;
  } else if (type === "CASHBACK_PERCENT") {
    return `Cashback ${value}%${maxDiscount ? ` (Maks Rp ${maxDiscount.toLocaleString("id-ID")})` : ""}`;
  } else if (type === "FEE_WAIVER") {
    return "Gratis Biaya Admin";
  }
  return `${value}`;
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${startDate.toLocaleDateString("id-ID", opt)} - ${endDate.toLocaleDateString("id-ID", opt)}`;
}
