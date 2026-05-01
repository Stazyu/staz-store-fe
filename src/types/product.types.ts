// ============================================================
// Product Types — Server-side filtering, sorting & pagination
// ============================================================

/** A single pricing tier entry */
export type ProductTierCode = "BRONZE" | "SILVER" | "GOLD" | string;

export interface ProductPricingItem {
    tierCode: ProductTierCode;
    price: number;
}

export interface ProductBrand {
    id: string;
    name: string;
    code: string;
}

export interface ProductCategory {
    id: string;
    name: string;
}

export interface ProductItem {
    id: string;
    name: string;
    skuCode?: string;
    supplierCode: string;
    type: string;
    basePrice: number;
    offlinePrice: number | null;
    stock: number | null;
    sold: number | null;
    productStatus: boolean;
    sellerProductStatus: boolean;
    isManualProcess: boolean;
    createdAt: string;
    updatedAt: string;
    brand: ProductBrand;
    category: ProductCategory;
    productPricing?: ProductPricingItem[];
}

// -------- Query Params (for server-side filtering) --------

export type ProductSortBy = "createdAt" | "updatedAt" | "name" | "basePrice";
export type SortOrder = "asc" | "desc";

export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    brandId?: string;
    categoryId?: string;
    type?: string;
    productStatus?: boolean;
    sellerProductStatus?: boolean;
    isManualProcess?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: ProductSortBy;
    sortOrder?: SortOrder;
    includePricing?: boolean;
}

// -------- API Responses --------

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface GetProductsResponse {
    status: "success" | string;
    message: string;
    data: ProductItem[];
    meta: PaginationMeta;
}

export interface ProductResponse {
    success: boolean;
    message?: string;
    data: ProductItem;
}

// -------- Mutation DTOs --------

export interface CreateProductDto {
    name: string;
    skuCode?: string | null;
    supplierCode: string;
    brandId: string;
    category: string;
    categoryId: string;
    type: string;
    sellerProductStatus: boolean;
    productStatus: boolean;
    isManualProcess: boolean;
    basePrice?: number;
    stock?: number;
    sold?: number;
    /** Pricing tiers — backend expects [{tierCode, price}] */
    productPricing?: { tierCode: string; price: number }[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

// -------- Error Typing --------

export class ProductApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'ProductApiError';
        this.statusCode = statusCode;
    }
}

// -------- Helpers --------

/**
 * Safely format a price value. Returns formatted string or fallback.
 * Guards against undefined, null, NaN values.
 */
export function safePrice(value: unknown): number {
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}