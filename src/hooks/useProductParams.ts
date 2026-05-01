"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import type { GetProductsParams, ProductSortBy } from "@/types/product.types";
import { DEFAULT_PRODUCT_PARAMS } from "@/constants/product.constants";

const DEBOUNCE_MS = 400;

/**
 * - Search is debounced by 400ms
 * - Changing any filter auto-resets page to 1
 * - All params are typed and validated
 */
export function useProductParams() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Debounce timer ref
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Local search input (for instant UI feedback before debounce fires)
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || ""
    );

    // Sync searchInput when URL changes externally
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        setSearchInput(urlSearch);
    }, [searchParams]);

    // Parse current params from URL
    const params: GetProductsParams = useMemo(() => ({
        page: Number(searchParams.get("page")) || DEFAULT_PRODUCT_PARAMS.page,
        limit: Number(searchParams.get("limit")) || DEFAULT_PRODUCT_PARAMS.limit,
        search: searchParams.get("search") || undefined,
        brandId: searchParams.get("brandId") || undefined,
        categoryId: searchParams.get("categoryId") || undefined,
        type: searchParams.get("type") || undefined,
        productStatus: searchParams.get("productStatus") === "true" ? true : searchParams.get("productStatus") === "false" ? false : undefined,
        sellerProductStatus: searchParams.get("sellerProductStatus") === "true" ? true : searchParams.get("sellerProductStatus") === "false" ? false : undefined,
        isManualProcess: searchParams.get("isManualProcess") === "true" ? true : searchParams.get("isManualProcess") === "false" ? false : undefined,
        minPrice: Number(searchParams.get("minPrice")) || undefined,
        maxPrice: Number(searchParams.get("maxPrice")) || undefined,
        sortBy: searchParams.get("sortBy") as ProductSortBy || DEFAULT_PRODUCT_PARAMS.sortBy,
        sortOrder: (searchParams.get("sortOrder") as 'asc' | 'desc') || DEFAULT_PRODUCT_PARAMS.sortOrder,
        includePricing: searchParams.get("includePricing") === "true",
    }), [searchParams]);

    // Core function to update URL params
    const updateParams = useCallback(
        (updates: Partial<GetProductsParams>, resetPage = true) => {
            const newParams = new URLSearchParams(searchParams.toString());

            // Apply updates
            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === '' || value === null) {
                    newParams.delete(key);
                } else {
                    newParams.set(key, String(value));
                }
            });

            // Reset page to 1 when filters change (but not when page itself is being set)
            if (resetPage && !('page' in updates)) {
                newParams.set("page", "1");
            }

            // Clean up default values to keep URL clean
            if (newParams.get("page") === "1") newParams.delete("page");
            if (newParams.get("limit") === String(DEFAULT_PRODUCT_PARAMS.limit)) newParams.delete("limit");
            if (newParams.get("sortBy") === DEFAULT_PRODUCT_PARAMS.sortBy) newParams.delete("sortBy");
            if (newParams.get("sortOrder") === DEFAULT_PRODUCT_PARAMS.sortOrder) newParams.delete("sortOrder");

            const qs = newParams.toString();
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        },
        [searchParams, router, pathname]
    );

    // Search with debounce
    const setSearch = useCallback(
        (value: string) => {
            setSearchInput(value);

            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }

            searchTimerRef.current = setTimeout(() => {
                updateParams({ search: value || undefined });
            }, DEBOUNCE_MS);
        },
        [updateParams]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    // Set a single filter value
    const setFilter = useCallback(
        (key: keyof GetProductsParams, value: unknown) => {
            updateParams({ [key]: value as any });
        },
        [updateParams]
    );

    // Set sort (toggle direction if same field)
    const setSort = useCallback(
        (field: string) => {
            const currentSortBy = params.sortBy || DEFAULT_PRODUCT_PARAMS.sortBy;
            const currentOrder = params.sortOrder || DEFAULT_PRODUCT_PARAMS.sortOrder;

            if (currentSortBy === field) {
                // Toggle direction
                updateParams({
                    sortBy: field,
                    sortOrder: currentOrder === 'asc' ? 'desc' : 'asc',
                }, false);
            } else {
                // New field, default to ascending
                updateParams({
                    sortBy: field as ProductSortBy,
                    sortOrder: 'asc',
                }, false);
            }
        },
        [params.sortBy, params.sortOrder, updateParams]
    );

    // Set page
    const setPage = useCallback(
        (page: number) => {
            updateParams({ page: page > 1 ? page : undefined }, false);
        },
        [updateParams]
    );

    // Reset all filters
    const resetFilters = useCallback(() => {
        setSearchInput("");
        router.replace(pathname, { scroll: false });
    }, [router, pathname]);

    return {
        params,
        searchInput,
        setSearch,
        setFilter,
        setSort,
        setPage,
        resetFilters,
    };
}
