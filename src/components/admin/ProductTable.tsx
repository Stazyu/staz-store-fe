"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/services/brand.client";
import { fetchCategories } from "@/services/category.client";
import type { ProductItem, CreateProductDto, ProductPricingItem } from "@/types/product.types";
import { ProductApiError } from "@/types/product.types";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useProductById } from "@/hooks/useProductQuery";
import { useProductParams } from "@/hooks/useProductParams";
import { formatRupiah, safePrice } from "@/lib/utils";
import toast from "react-hot-toast";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    FiEdit2, FiTrash2, FiEye, FiSearch, FiPackage, FiLayers, FiTag,
    FiChevronLeft, FiChevronRight, FiX, FiCheckCircle, FiCircle,
    FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw, FiDollarSign
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

// ============================================================
// ProductTable — Server-side filtering, sorting & pagination
// ============================================================

/** Safely extract a display string from a field that might be a string or {id, name} object */
function toStr(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'name' in value) return String((value as { name: string }).name);
    return '-';
}

/** Safe formatRupiah that never returns NaN */
function safeFormatRupiah(value: unknown): string {
    const num = safePrice(value);
    return formatRupiah(num);
}

// -------- Pricing Row Types --------
interface PricingRow {
    tierCode: string;
    price: string; // kept as string for form input
}

function ProductTableInner() {
    const {
        params,
        searchInput,
        setSearch,
        setFilter,
        setSort,
        setPage,
        resetFilters,
    } = useProductParams();

    // -------- Server-side data --------
    const { data: response, isLoading, error, isFetching } = useProducts({ ...params, includePricing: true });

    const products = response?.data ?? [];
    const pagination = response?.meta ?? {
        total: products.length,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: Math.max(1, Math.ceil(products.length / (params.limit || 20))),
        hasNextPage: false,
        hasPrevPage: false
    };

    // -------- Reference data --------
    const { data: brands = [] as any[] } = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrands,
    });

    const { data: categories = [] as any[] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    // -------- Cascading Filter Logic --------
    const filteredBrands = React.useMemo(() => {
        let list = brands;
        if (params.categoryId && params.categoryId !== "__all__") {
            list = brands.filter(b => b.categoryId === params.categoryId || (typeof b.category === 'object' && b.category?.id === Number(params.categoryId)));
        }
        const seen = new Set();
        return list.filter(b => {
            if (!b || !b.name) return false;
            const key = b.name.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [brands, params.categoryId]);

    const filteredCategories = React.useMemo(() => {
        const seen = new Set();
        return categories.filter(c => {
            if (!c || !c.id) return false;
            const key = `${c.id}-${c.name}`.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [categories]);

    const filteredTypes = React.useMemo(() => {
        let sourceBrands = brands;
        if (params.brandId && params.brandId !== "__all__") {
            sourceBrands = brands.filter(b => b.id === params.brandId);
        } else if (params.categoryId && params.categoryId !== "__all__") {
            sourceBrands = filteredBrands;
        }

        const types = sourceBrands.flatMap(b => b.types?.map((t: any) => t.name) || []).filter((t: any) => t && t.trim() !== "") as string[];
        return Array.from(new Set(types)).sort();
    }, [brands, filteredBrands, params.brandId, params.categoryId]);

    // -------- Local UI state (dialogs) --------
    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

    // -------- Fetch detail for edit (to get productPricing) --------
    const { data: detailForEdit, isFetching: isLoadingDetail } = useProductById(editId);

    // Populate form when detail loads for edit
    useEffect(() => {
        if (detailForEdit && editId) {
            setEditProduct(detailForEdit);
            setFormValues({
                name: detailForEdit.name,
                skuCode: detailForEdit.skuCode || "",
                supplierCode: detailForEdit.supplierCode || "",
                brandId: detailForEdit.brand?.id || "",
                category: detailForEdit.category?.name || "",
                categoryId: detailForEdit.category?.id || "",
                type: toStr(detailForEdit.type),
                sellerProductStatus: detailForEdit.sellerProductStatus,
                productStatus: detailForEdit.productStatus,
                isManualProcess: detailForEdit.isManualProcess,
                basePrice: detailForEdit.basePrice != null ? String(detailForEdit.basePrice) : "",
                stock: detailForEdit.stock != null ? String(detailForEdit.stock) : "",
                sold: detailForEdit.sold != null ? String(detailForEdit.sold) : "",
            });
            // Populate pricing rows from detail
            if (detailForEdit.productPricing && detailForEdit.productPricing.length > 0) {
                setPricingRows(
                    detailForEdit.productPricing.map(t => ({
                        tierCode: t.tierCode,
                        price: String(safePrice(t.price)),
                    }))
                );
            } else {
                setPricingRows([]);
            }
        }
    }, [detailForEdit, editId]);

    // -------- Form state --------
    const [formValues, setFormValues] = useState({
        name: "",
        skuCode: "",
        supplierCode: "",
        brandId: "",
        category: "",
        categoryId: "",
        type: "",
        sellerProductStatus: false,
        productStatus: true,
        isManualProcess: true,
        basePrice: "",
        stock: "",
        sold: "",
    });

    // -------- Pricing rows state --------
    const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);

    const setField = <K extends keyof typeof formValues>(key: K, value: typeof formValues[K]) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const updatePricingRow = (index: number, field: keyof PricingRow, value: string) => {
        setPricingRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    // -------- Mutations --------
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    // -------- Handlers --------

    const resetForm = () => {
        setFormValues({
            name: "", skuCode: "", supplierCode: "", brandId: "", category: "", type: "",
            sellerProductStatus: true, productStatus: true, isManualProcess: true,
            basePrice: "", stock: "", sold: "", categoryId: "",
        });
        setPricingRows([]);
        setFormError(null);
        setEditId(null);
        setEditProduct(null);
    };

    const handleAdd = () => {
        resetForm();
        setFormOpen(true);
    };

    const handleEdit = (product: ProductItem) => {
        // Set editId — the useEffect with detailForEdit will populate form once detail loads
        setEditId(product.id);
        setEditProduct(product);
        // Set basic values immediately from list data
        setFormValues({
            name: product.name,
            skuCode: product.skuCode || "",
            supplierCode: product.supplierCode || "",
            brandId: product.brand?.id || "",
            category: product.category?.name || "",
            categoryId: product.category?.id || "",
            type: toStr(product.type),
            sellerProductStatus: product.sellerProductStatus,
            productStatus: product.productStatus,
            isManualProcess: product.isManualProcess,
            basePrice: product.basePrice != null ? String(product.basePrice) : "",
            stock: product.stock != null ? String(product.stock) : "",
            sold: product.sold != null ? String(product.sold) : "",
        });
        // Pricing will be loaded from detail endpoint via useEffect
        if (product.productPricing && product.productPricing.length > 0) {
            setPricingRows(product.productPricing.map(t => ({
                tierCode: t.tierCode,
                price: String(safePrice(t.price)),
            })));
        } else {
            setPricingRows([]);
        }
        setFormError(null);
        setFormOpen(true);
    };

    /** Handle mutation errors with specific UX for 409/400/404 */
    const handleMutationError = (err: unknown) => {
        if (err instanceof ProductApiError) {
            switch (err.statusCode) {
                case 409:
                    setFormError("SKU Code sudah digunakan. Gunakan kode SKU yang berbeda.");
                    toast.error("SKU Code sudah digunakan!");
                    return;
                case 400:
                    setFormError(err.message || "Data tidak valid. Periksa kembali brand, category, dan pricing.");
                    toast.error(err.message || "Data tidak valid!");
                    return;
                case 404:
                    setFormError(err.message || "Produk, Brand, Category, atau Tier tidak ditemukan.");
                    toast.error("Resource tidak ditemukan!");
                    return;
                default:
                    break;
            }
        }
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        setFormError(msg);
        toast.error(msg);
    };

    /** Validate pricing rows before submit */
    const validatePricing = (): string | null => {
        const tierCodes = new Set<string>();
        for (let i = 0; i < pricingRows.length; i++) {
            const row = pricingRows[i];
            if (!row.tierCode.trim()) {
                return `Baris pricing #${i + 1}: Tier Code tidak boleh kosong.`;
            }
            if (row.price === "" || row.price === undefined) {
                return `Baris pricing #${i + 1}: Harga harus diisi.`;
            }
            const priceNum = Number(row.price);
            if (!Number.isFinite(priceNum) || priceNum < 0) {
                return `Baris pricing #${i + 1}: Harga harus angka >= 0.`;
            }
            if (tierCodes.has(row.tierCode.trim())) {
                return `Baris pricing #${i + 1}: Tier Code "${row.tierCode}" duplikat.`;
            }
            tierCodes.add(row.tierCode.trim());
        }
        return null;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validate pricing
        const pricingError = validatePricing();
        if (pricingError) {
            setFormError(pricingError);
            toast.error(pricingError);
            return;
        }

        // Build productPricing array — only include rows with values
        const productPricing = pricingRows
            .filter(r => r.tierCode.trim() && r.price !== "")
            .map(r => ({
                tierCode: r.tierCode.trim(),
                price: Number(r.price),
            }));

        const productData: CreateProductDto = {
            name: formValues.name,
            skuCode: formValues.skuCode === "" ? null : formValues.skuCode,
            supplierCode: formValues.supplierCode,
            brandId: formValues.brandId,
            category: formValues.category,
            categoryId: formValues.categoryId,
            type: formValues.type,
            sellerProductStatus: formValues.sellerProductStatus,
            productStatus: formValues.productStatus,
            isManualProcess: formValues.isManualProcess,
            basePrice: formValues.basePrice ? Number(formValues.basePrice) : undefined,
            stock: formValues.stock ? Number(formValues.stock) : undefined,
            sold: formValues.sold ? Number(formValues.sold) : undefined,
            productPricing: productPricing.length > 0 ? productPricing : undefined,
        };

        try {
            if (editId) {
                await updateMutation.mutateAsync({ id: editId, data: productData });
                toast.success("Produk berhasil diperbarui!");
            } else {
                await createMutation.mutateAsync(productData);
                toast.success("Produk berhasil ditambahkan!");
            }
            setFormOpen(false);
            resetForm();
        } catch (err) {
            handleMutationError(err);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Produk berhasil dihapus!");
            setDeleteTarget(null);

            // If current page becomes empty, go back
            if (products.length === 1 && pagination.page > 1) {
                setPage(pagination.page - 1);
            }
        } catch (err) {
            handleMutationError(err);
        }
    };

    // -------- View detail handler (fetches full detail with pricing) --------
    const [detailId, setDetailId] = useState<string | null>(null);
    const { data: fetchedDetail, isFetching: isLoadingViewDetail } = useProductById(detailId);

    useEffect(() => {
        if (fetchedDetail && detailId) {
            setDetailProduct(fetchedDetail);
        }
    }, [fetchedDetail, detailId]);

    const handleViewDetail = (product: ProductItem) => {
        setDetailProduct(product); // show immediately with list data
        setDetailId(product.id);  // trigger detail fetch for full pricing
    };

    // -------- Sort indicator --------
    const SortIcon = ({ field }: { field: string }) => {
        const currentSort = params.sortBy || "createdAt";
        const currentOrder = params.sortOrder || "desc";
        if (currentSort !== field) return null;
        return currentOrder === "asc"
            ? <FiArrowUp className="h-3 w-3" />
            : <FiArrowDown className="h-3 w-3" />;
    };

    // ============================
    // LOADING STATE
    // ============================
    if (isLoading && !response) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl animate-pulse opacity-20"></div>
                            <div className="absolute inset-2 bg-linear-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                                <FiPackage className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -inset-4 bg-linear-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl animate-pulse"></div>
                        </div>
                        <div className="flex justify-center gap-2 mt-6">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold bg-linear-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Memuat Data Produk
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sedang mengambil data dari server...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================
    // ERROR STATE
    // ============================
    if (error && !response) {
        return (
            <div className="min-h-[500px] flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-0 bg-linear-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-2xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-800/50 p-8 shadow-xl">
                        <div className="text-center space-y-6">
                            <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 bg-linear-to-br from-red-500 to-orange-500 rounded-2xl animate-pulse opacity-20"></div>
                                <div className="absolute inset-2 bg-linear-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <FiX className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Oops! Terjadi Kesalahan</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{(error as Error).message}</p>
                            </div>
                            <Button
                                onClick={() => resetFilters()}
                                className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                Coba Lagi
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================
    // MAIN RENDER
    // ============================
    return (
        <div className="space-y-6">
            {/* ==================== HEADER SECTION ==================== */}
            <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div className="absolute top-4 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-20 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl"></div>
                <div className="relative px-8 py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <FiPackage className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                        Kelola Produk
                                    </h1>
                                    <p className="text-teal-100 text-base mt-1">
                                        Kelola dan pantau semua produk digital
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <FiLayers className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-teal-200">Total Produk</p>
                                    <p className="text-xl font-bold text-white">{pagination.total}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleAdd}
                                className="bg-white hover:bg-gray-50 text-emerald-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <HiOutlineSparkles className="h-5 w-5" />
                                Tambah Produk
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== FILTER BAR ==================== */}
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 p-5">
                <div className="flex flex-col gap-4">
                    {/* Row 1: Search + Brand + Category */}
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md w-full">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                                <FiSearch className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />
                            </div>
                            <Input
                                placeholder="Cari produk berdasarkan nama atau SKU..."
                                value={searchInput}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-14 pr-4 py-3 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                            />
                        </div>

                        {/* Brand Filter */}
                        <div className="w-full sm:w-56">
                            <Select
                                value={params.brandId || "__all__"}
                                onValueChange={(v) => setFilter("brandId", v === "__all__" ? undefined : v)}
                            >
                                <SelectTrigger className="h-[46px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                                            <FiFilter className="text-emerald-600 dark:text-emerald-400 h-3.5 w-3.5" />
                                        </div>
                                        <SelectValue placeholder="Semua Brand" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                                    <SelectItem value="__all__" className="rounded-lg">
                                        <span className="font-medium">Semua Brand</span>
                                    </SelectItem>
                                    {filteredBrands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id} className="rounded-lg">
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="w-full sm:w-56">
                            <Select
                                value={params.categoryId || "__all__"}
                                onValueChange={(v) => setFilter("categoryId", v === "__all__" ? undefined : v)}
                            >
                                <SelectTrigger className="h-[46px] rounded-xl border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-linear-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
                                            <FiLayers className="text-teal-600 dark:text-teal-400 h-3.5 w-3.5" />
                                        </div>
                                        <SelectValue placeholder="Semua Kategori" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                                    <SelectItem value="__all__" className="rounded-lg">
                                        <span className="font-medium">Semua Kategori</span>
                                    </SelectItem>
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Status + Type + Reset */}
                    <div className="flex flex-wrap gap-3 items-start lg:items-center">
                        {/* Type Filter */}
                        <div className="w-full sm:w-48">
                            <Select
                                value={params.type || "__all__"}
                                onValueChange={(v) => setFilter("type", v === "__all__" ? undefined : v)}
                            >
                                <SelectTrigger className="h-[42px] rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FiTag className="text-gray-400 h-4 w-4" />
                                        <SelectValue placeholder="Semua Tipe" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="__all__" className="rounded-lg">Semua Tipe</SelectItem>
                                    {filteredTypes.map((t) => (
                                        <SelectItem key={t} value={t} className="rounded-lg">{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Product Status Filter */}
                        <div className="w-full sm:w-48">
                            <Select
                                value={params.productStatus === true ? "true" : params.productStatus === false ? "false" : "__all__"}
                                onValueChange={(v) => setFilter("productStatus", v === "__all__" ? undefined : v === "true")}
                            >
                                <SelectTrigger className="h-[42px] rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                                    <SelectValue placeholder="Status Produk" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="__all__" className="rounded-lg">Semua Status</SelectItem>
                                    <SelectItem value="true" className="rounded-lg">
                                        <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500 h-3.5 w-3.5" /> Aktif</span>
                                    </SelectItem>
                                    <SelectItem value="false" className="rounded-lg">
                                        <span className="flex items-center gap-1.5"><FiCircle className="text-gray-400 h-3.5 w-3.5" /> Nonaktif</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Manual Process Filter */}
                        <div className="w-full sm:w-48">
                            <Select
                                value={params.isManualProcess === true ? "true" : params.isManualProcess === false ? "false" : "__all__"}
                                onValueChange={(v) => setFilter("isManualProcess", v === "__all__" ? undefined : v === "true")}
                            >
                                <SelectTrigger className="h-[42px] rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                                    <SelectValue placeholder="Proses" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="__all__" className="rounded-lg">Semua Proses</SelectItem>
                                    <SelectItem value="true" className="rounded-lg">Manual</SelectItem>
                                    <SelectItem value="false" className="rounded-lg">Otomatis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="h-[42px] rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm gap-2"
                        >
                            <FiFilter className="h-4 w-4" />
                            Reset Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* ==================== TABLE ==================== */}
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-linear-to-r from-gray-50/80 to-gray-50/40 dark:from-gray-800/80 dark:to-gray-800/40">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-lg">
                            <FiLayers className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Daftar Produk</h3>
                        {isFetching && (
                            <div className="ml-2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>

                <div>
                    <Table>
                        <TableHeader className="overflow-visible">
                            <TableRow className="bg-linear-to-r from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 border-b border-gray-100 dark:border-gray-700/50 overflow-visible">
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 py-4 text-xs uppercase tracking-wider w-[50px] text-center">No</TableHead>
                                <TableHead
                                    className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                                    onClick={() => setSort('name')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Produk
                                        <SortIcon field="name" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider">SKU</TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider">Supplier</TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider">Brand</TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider">Kategori</TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider">Tipe</TableHead>
                                <TableHead
                                    className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider text-right cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                                    onClick={() => setSort('basePrice')}
                                >
                                    <div className="flex items-center justify-end gap-1.5">
                                        Harga
                                        <SortIcon field="basePrice" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider text-center cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                                    onClick={() => setSort('stock')}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        Stock
                                        <SortIcon field="stock" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider text-center">Status</TableHead>
                                <TableHead className="font-bold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wider text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="overflow-visible">
                            {products.length > 0 ? (
                                products.map((product, index) => {
                                    const rowNum = ((pagination.page - 1) * pagination.limit) + index + 1;
                                    const basePrice = product.basePrice!;
                                    const tierCount = product.productPricing?.length ?? 0;

                                    return (
                                        <TableRow
                                            key={product.id}
                                            className="group hover:bg-linear-to-r hover:from-emerald-50/30 hover:via-teal-50/20 hover:to-cyan-50/30 dark:hover:from-emerald-900/5 dark:hover:via-teal-900/5 dark:hover:to-cyan-900/5 transition-all duration-300 border-b border-gray-50 dark:border-gray-800 overflow-visible"
                                        >
                                            <TableCell className="py-4 text-center">
                                                <div className="w-8 h-8 mx-auto flex items-center justify-center bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                    {rowNum}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{product.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                {product.skuCode ? (
                                                    <code className="text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                        {product.skuCode}
                                                    </code>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-2.5 py-1.5 rounded-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                                    {product.supplierCode}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand?.name || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    {product.category?.name || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{toStr(product.type) || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-right overflow-visible">
                                                <div className="relative group/price inline-block">
                                                    <div className="cursor-default">
                                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                                            {basePrice > 0 ? safeFormatRupiah(basePrice) : '-'}
                                                        </span>
                                                        {tierCount > 0 && (
                                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                                <FiDollarSign className="h-2.5 w-2.5 text-blue-500" />
                                                                <span className="text-[10px] text-blue-500 font-medium">{tierCount} tier{tierCount > 1 ? 's' : ''}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Hover tooltip showing all tiers */}
                                                    {tierCount > 0 && (
                                                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 opacity-0 invisible group-hover/price:opacity-100 group-hover/price:visible transition-all duration-200">
                                                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] max-h-none overflow-visible">
                                                                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Detail Harga</p>
                                                                <div className="space-y-1.5">
                                                                    {product.productPricing!.map((tier, i) => (
                                                                        <div key={tier.tierCode || i} className="flex items-center justify-between gap-4 text-xs">
                                                                            <span className="text-gray-500 dark:text-gray-400 font-mono">{tier.tierCode}</span>
                                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{safeFormatRupiah(tier.price)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.stock ?? '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {product.productStatus ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                            <FiCheckCircle className="h-2.5 w-2.5" /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
                                                            <FiCircle className="h-2.5 w-2.5" /> Nonaktif
                                                        </span>
                                                    )}
                                                    {product.isManualProcess && (
                                                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                                            Manual
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                        <Button
                                                            title="Lihat Detail"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(product)}
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            title="Edit"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(product)}
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                                                        >
                                                            <FiEdit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            title="Hapus"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteTarget(product)}
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                /* ==================== EMPTY STATE ==================== */
                                <TableRow>
                                    <TableCell colSpan={11} className="py-16">
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 mx-auto bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
                                                <FiPackage className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tidak Ada Produk Ditemukan</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                                    Tidak ada produk yang sesuai dengan filter saat ini. Coba ubah filter atau tambahkan produk baru.
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-3">
                                                <Button variant="outline" onClick={resetFilters} className="rounded-xl text-sm">
                                                    <FiFilter className="mr-2 h-4 w-4" /> Reset Filter
                                                </Button>
                                                <Button onClick={handleAdd} className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm">
                                                    <HiOutlineSparkles className="mr-2 h-4 w-4" /> Tambah Produk
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ==================== PAGINATION ==================== */}
                {pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-linear-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/80 dark:to-gray-900/50 border-t border-gray-100 dark:border-gray-700/50 rounded-b-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <FiLayers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {(() => {
                                    const startItem = (pagination.page - 1) * pagination.limit + 1;
                                    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);
                                    return (
                                        <>
                                            Menampilkan <span className="font-bold text-emerald-600 dark:text-emerald-400">{startItem}-{endItem}</span> dari <span className="font-bold text-gray-900 dark:text-gray-100">{pagination.total}</span> produk
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Halaman</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{pagination.page}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">dari</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{pagination.totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="h-9 px-3 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <FiChevronLeft className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Prev</span>
                                </Button>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="h-9 px-3 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <span className="text-sm">Next</span>
                                    <FiChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== DELETE DIALOG ==================== */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="space-y-1 text-left">
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Hapus Produk
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 dark:text-gray-400">
                                    Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Produk'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== DETAIL DIALOG ==================== */}
            <Dialog open={!!detailProduct} onOpenChange={(open) => { if (!open) { setDetailProduct(null); setDetailId(null); } }}>
                <DialogContent className="sm:max-w-[600px] p-0 border-0 shadow-2xl rounded-2xl max-h-none">
                    <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl font-bold">{detailProduct?.name}</DialogTitle>
                                <p className="text-teal-100 text-sm mt-1">{detailProduct?.skuCode}</p>
                            </div>
                            <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                                <FiPackage className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {detailProduct && (
                        <div className="p-6 space-y-6 bg-white dark:bg-slate-900 max-h-none">
                            {/* Status badges */}
                            <div className="flex flex-wrap gap-2">
                                {detailProduct.productStatus ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                        <FiCheckCircle className="h-3 w-3" /> Produk Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        <FiCircle className="h-3 w-3" /> Produk Nonaktif
                                    </span>
                                )}
                                {detailProduct.isManualProcess ? (
                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                                        Manual Process
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                        Automatic Process
                                    </span>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-100 dark:border-gray-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</p>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailProduct.brand?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Code</p>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailProduct.supplierCode || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</p>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{toStr(detailProduct.category)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</p>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{toStr(detailProduct.type)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock / Terjual</p>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailProduct.stock ?? '-'} / {detailProduct.sold ?? '0'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Rincian Harga</h4>
                                    {isLoadingViewDetail && (
                                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </div>
                                {detailProduct.productPricing && detailProduct.productPricing.length > 0 ? (
                                    <div className="space-y-2">
                                        {detailProduct.productPricing.map((tier, i) => (
                                            <div key={tier.tierCode || i} className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                        <FiDollarSign className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{tier.tierCode}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{safeFormatRupiah(tier.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <FiDollarSign className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Belum ada data harga</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 border-0 rounded-xl"
                                onClick={() => { setDetailProduct(null); setDetailId(null); }}
                            >
                                Tutup
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ==================== CREATE / EDIT DIALOG ==================== */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm(); } }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                                {editId ? <FiEdit2 className="w-6 h-6 text-white" /> : <HiOutlineSparkles className="w-6 h-6 text-white" />}
                            </div>
                            <div className="space-y-1 text-left">
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 dark:text-gray-400">
                                    {editId ? 'Perbarui informasi produk di bawah ini' : 'Isi detail produk baru di bawah ini'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Loading detail for edit */}
                    {editId && isLoadingDetail && (
                        <div className="mx-1 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p>Memuat detail produk dan harga...</p>
                            </div>
                        </div>
                    )}

                    {/* Limited edit notice for non-manual products */}
                    {editId && editProduct && !editProduct.isManualProcess && (
                        <div className="mx-1 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
                            <div className="flex items-start gap-3">
                                <FiEye className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Mode Edit Terbatas</p>
                                    <p className="mt-1 text-amber-600 dark:text-amber-400">Produk ini bukan manual process. Hanya <span className="font-semibold">Pricing</span> dan <span className="font-semibold">Status Produk</span> yang dapat diubah.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Alert */}
                    {formError && (
                        <div className="mx-1 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                            <div className="flex items-start gap-3">
                                <FiX className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Gagal menyimpan produk</p>
                                    <p className="mt-1 text-red-600 dark:text-red-400">{formError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-5 mt-2">
                        {(() => {
                            // Non-manual products: only pricing & productStatus are editable
                            const isLimited = !!editId && !!editProduct && !editProduct.isManualProcess;
                            const disabledCls = "rounded-xl border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 opacity-60 cursor-not-allowed";
                            const normalCls = "rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800";
                            return (
                                <>
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Informasi Dasar</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Produk *</label>
                                                <Input required disabled={isLimited} value={formValues.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nama produk" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU Code</label>
                                                <Input value={formValues.skuCode} onChange={(e) => setField("skuCode", e.target.value)} placeholder="Opsional" className={formError?.includes('SKU') ? 'border-red-500 ring-1 ring-red-500' : ''} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Code *</label>
                                                <Input required disabled={isLimited} value={formValues.supplierCode} onChange={(e) => setField("supplierCode", e.target.value)} placeholder="Wajib diisi" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori *</label>
                                                <Select required value={formValues.categoryId} onValueChange={(v) => setField("categoryId", v)} disabled={isLimited}>
                                                    <SelectTrigger className={isLimited ? disabledCls : normalCls}>
                                                        <SelectValue placeholder="Pilih Kategori" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id} className="rounded-lg">{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand *</label>
                                                <Select value={formValues.brandId} onValueChange={(v) => setField("brandId", v)} disabled={isLimited}>
                                                    <SelectTrigger className={isLimited ? disabledCls : normalCls}>
                                                        <SelectValue placeholder="Pilih Brand" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {brands.map((brand) => (
                                                            <SelectItem key={brand.id} value={brand.id} className="rounded-lg">{brand.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipe *</label>
                                                <Input required disabled={isLimited} value={formValues.type} onChange={(e) => setField("type", e.target.value)} placeholder="e.g. Top Up" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Price</label>
                                                <Input type="number" min="0" disabled={isLimited} value={formValues.basePrice} onChange={(e) => setField("basePrice", e.target.value)} placeholder="0" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ==================== PRICING TIERS ==================== */}
                                    {editId ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Harga per Tier</h4>
                                                {isLimited && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">Read Only</span>
                                                )}
                                            </div>

                                            {pricingRows.length > 0 ? (
                                                <div className="space-y-3">
                                                    {pricingRows.map((row, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 w-6">
                                                                <span className="font-bold">#{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <label className="text-xs text-gray-500">Tier Code</label>
                                                                <Input
                                                                    value={row.tierCode}
                                                                    disabled
                                                                    className="rounded-lg border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 text-sm h-9 opacity-70 cursor-not-allowed font-mono"
                                                                />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <label className={`text-xs ${!isLimited ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500'}`}>
                                                                    Harga (Rp) {!isLimited && <span className="text-emerald-500">(editable)</span>}
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    disabled={isLimited}
                                                                    value={row.price}
                                                                    onChange={(e) => updatePricingRow(index, "price", e.target.value)}
                                                                    placeholder="0"
                                                                    className={isLimited
                                                                        ? "rounded-lg border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 text-sm h-9 opacity-70 cursor-not-allowed"
                                                                        : "rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm h-9 ring-2 ring-emerald-500/20 border-emerald-300 dark:border-emerald-700"
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                    <FiDollarSign className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {isLoadingDetail ? 'Memuat data harga...' : 'Belum ada tier harga dari backend'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Harga per Tier</h4>
                                            <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-dashed border-blue-200 dark:border-blue-800">
                                                <FiDollarSign className="h-6 w-6 text-blue-400 dark:text-blue-600 mx-auto mb-2" />
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Tier harga akan otomatis dibuat oleh sistem</p>
                                                <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">Anda dapat mengatur harga setelah produk dibuat</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock & Status */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stock & Status</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                                                <Input type="number" disabled={isLimited} value={formValues.stock} onChange={(e) => setField("stock", e.target.value)} placeholder="Opsional" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Terjual</label>
                                                <Input type="number" disabled={isLimited} value={formValues.sold} onChange={(e) => setField("sold", e.target.value)} placeholder="Opsional" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={formValues.productStatus} onChange={(e) => setField("productStatus", e.target.checked)} className={`w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 ${isLimited ? 'ring-2 ring-emerald-500/30' : ''}`} />
                                                <span className={`text-sm ${isLimited ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>Produk Aktif {isLimited && <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">(editable)</span>}</span>
                                            </label>

                                        </div>
                                    </div>
                                </>);
                        })()}

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button type="button" variant="outline" onClick={() => { setFormOpen(false); resetForm(); }} className="w-full sm:w-auto rounded-xl dark:border-gray-700 dark:text-gray-300">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {(createMutation.isPending || updateMutation.isPending)
                                    ? 'Menyimpan...'
                                    : editId ? 'Simpan Perubahan' : 'Tambah Produk'
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function ProductTable() {
    return (
        <Suspense fallback={
            <div className="min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Memuat...</p>
                </div>
            </div>
        }>
            <ProductTableInner />
        </Suspense>
    );
}
