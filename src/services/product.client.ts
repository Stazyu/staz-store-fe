import { fetchWithJwt } from "@/lib/api-client";
import type {
    ProductItem,
    GetProductsParams,
    GetProductsResponse,
    ProductResponse,
    CreateProductDto,
    UpdateProductDto,
} from "@/types/product.types";
import { ProductApiError } from "@/types/product.types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`;

// -------- Helpers --------

/** Build a URLSearchParams string from GetProductsParams, skipping empty values */
function buildQueryString(params: GetProductsParams): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}

/** Parse backend error to ProductApiError with proper statusCode */
async function handleErrorResponse(response: Response): Promise<never> {
    let message = 'Terjadi kesalahan pada server';
    try {
        const body = await response.json();
        message = body.message || message;
    } catch {
        // ignore parse errors
    }
    throw new ProductApiError(message, response.status);
}

// -------- API Functions --------

/**
 * Fetch products with server-side filtering, sorting, and pagination.
 * All query params are sent to the backend — no client-side filtering.
 */
export const fetchProducts = async (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
    try {
        const qs = buildQueryString(params);
        const url = `${API_BASE_URL}${qs ? `?${qs}` : ''}`;

        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }

        const data: GetProductsResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof ProductApiError) throw error;
        console.error('Error in fetchProducts:', error);
        throw new ProductApiError(
            error instanceof Error ? error.message : 'Gagal mengambil data produk',
            500
        );
    }
};

/**
 * Fetch a single product by ID (includes productPricing).
 */
export const fetchProductById = async (id: string): Promise<ProductItem> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }

        const data: ProductResponse = await response.json();
        return data.data;
    } catch (error) {
        if (error instanceof ProductApiError) throw error;
        console.error('Error in fetchProductById:', error);
        throw new ProductApiError(
            error instanceof Error ? error.message : 'Gagal mengambil detail produk',
            500
        );
    }
};

/**
 * Create a new product with productPricing.
 * Throws ProductApiError with statusCode for:
 * - 409: skuCode already exists
 * - 400: brand & category mismatch / invalid tierCode / duplicate tierCode / price < 0
 * - 404: brand/category/tier not found
 */
export const createProduct = async (productData: CreateProductDto): Promise<ProductItem> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
            credentials: 'include',
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }

        const data = await response.json();
        return data.data || data.product;
    } catch (error) {
        if (error instanceof ProductApiError) throw error;
        console.error('Error in createProduct:', error);
        throw new ProductApiError(
            error instanceof Error ? error.message : 'Gagal membuat produk baru',
            500
        );
    }
};

/**
 * Update an existing product with productPricing.
 * If productPricing is sent, old pricing is fully replaced.
 * If productPricing is omitted, existing pricing is preserved.
 */
export const updateProduct = async (id: string, productData: UpdateProductDto): Promise<ProductItem> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
            credentials: 'include',
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }

        const data = await response.json();
        return data.data || data.product;
    } catch (error) {
        if (error instanceof ProductApiError) throw error;
        console.error('Error in updateProduct:', error);
        throw new ProductApiError(
            error instanceof Error ? error.message : 'Gagal memperbarui produk',
            500
        );
    }
};

/**
 * Delete a product by ID.
 */
export const deleteProduct = async (id: string): Promise<void> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }
    } catch (error) {
        if (error instanceof ProductApiError) throw error;
        console.error('Error in deleteProduct:', error);
        throw new ProductApiError(
            error instanceof Error ? error.message : 'Gagal menghapus produk',
            500
        );
    }
};

// Re-export types for convenience
export type { ProductItem as Product, GetProductsParams as ProductQueryParams, GetProductsResponse as ProductsResponse, CreateProductDto, UpdateProductDto };
export { ProductApiError } from "@/types/product.types";
