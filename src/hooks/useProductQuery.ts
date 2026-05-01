import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GetProductsParams, ProductItem, CreateProductDto, UpdateProductDto } from "@/types/product.types";
import {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "@/services/product.client";

// -------- Query Keys --------

export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (params: GetProductsParams) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

// -------- Queries --------

/**
 * Fetch paginated product list with server-side filtering/sorting.
 * Query key includes all params for automatic refetch on param change.
 */
export function useProducts(params: GetProductsParams) {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => fetchProducts(params),
        placeholderData: (previousData) => previousData, // keep old data while loading new
    });
}

/**
 * Fetch a single product by ID.
 */
export function useProductById(id: string | null) {
    return useQuery({
        queryKey: productKeys.detail(id!),
        queryFn: () => fetchProductById(id!),
        enabled: !!id,
    });
}

// -------- Mutations --------

/**
 * Create product mutation.
 * Invalidates all product list queries on success.
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductDto) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Update product mutation.
 * Invalidates both list and detail queries on success.
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
            updateProduct(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.id),
            });
        },
    });
}

/**
 * Delete product mutation.
 * Invalidates all product list queries on success.
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}
