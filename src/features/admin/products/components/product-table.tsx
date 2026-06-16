"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    FiX, FiCheckCircle, FiCircle,
    FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw, FiDollarSign,
    FiBox, FiTrendingUp, FiPlus, FiLoader
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

// Default colors for categories
const defaultCategoryColors: { [key: string]: string } = {
    'game': '#3b82f6',      // Blue
    'games': '#3b82f6',     // Same as Game
    'pulsa': '#10b981',     // Emerald
    'data': '#06b6d4',      // Cyan
    'voucher': '#ec4899',   // Pink
    'e-money': '#8b5cf6',   // Violet
    'emoney': '#8b5cf6',
    'pln': '#f59e0b',       // Amber
    'other': '#6b7280'      // Gray
};

function hslToHex(h: number, s: number, l: number): string {
    const sPercent = s / 100;
    const lPercent = l / 100;
    const a = sPercent * Math.min(lPercent, 1 - lPercent);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = lPercent - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

const getCategoryColor = (categoryName: string): string => {
    const clean = (categoryName || '').trim().toLowerCase();
    if (defaultCategoryColors[clean]) {
        return defaultCategoryColors[clean];
    }
    
    // Check partial matches for robustness
    if (clean.includes('game')) return '#3b82f6';
    if (clean.includes('pulsa')) return '#10b981';
    if (clean.includes('data') || clean.includes('internet')) return '#06b6d4';
    if (clean.includes('voucher')) return '#ec4899';
    if (clean.includes('e-money') || clean.includes('emoney') || clean.includes('wallet') || clean.includes('ovo') || clean.includes('gopay') || clean.includes('dana') || clean.includes('shopee') || clean.includes('linkaja')) return '#8b5cf6';
    if (clean.includes('pln') || clean.includes('listrik')) return '#f59e0b';

    // Generate deterministic hue from name
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
        hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    // Saturation 65%, Lightness 45% for a nice colored badge
    return hslToHex(hue, 65, 45);
};

// -------- Pricing Row Types --------
interface PricingRow {
    tierCode: string;
    price: string; // kept as string for form input
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
    );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/10 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-slate-900 dark:text-white font-bold text-base leading-none">{value}</div>
                <div className="text-slate-500 dark:text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{label}</div>
            </div>
        </div>
    );
}

function ProductTableInner() {
    const queryClient = useQueryClient();
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

    const stats = React.useMemo(() => {
        const pageActiveCount = products.filter(p => p.productStatus).length;
        const pageManualCount = products.filter(p => p.isManualProcess).length;
        const pageOtomatisCount = products.length - pageManualCount;
        return { pageActiveCount, pageManualCount, pageOtomatisCount };
    }, [products]);

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
            <div className="min-h-125 flex items-center justify-center">
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
        <div className="space-y-8 pb-8">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 dark:border-emerald-500/10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#052e25_45%,#06281f_100%)] shadow-[0_20px_80px_rgba(16,185,129,0.08)] p-8">
                <div
                    className="absolute inset-0 opacity-10 dark:opacity-10 opacity-5"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <LiveDot />
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Katalog Produk</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            Manajemen
                            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent ml-3">
                                Produk
                            </span>
                        </h1>
                        <p className="text-slate-600 dark:text-emerald-200/70 mt-3 text-base max-w-md">
                            Kelola inventaris produk, atur harga tier, sinkronisasi stok, dan status penjualan secara real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium border border-slate-200 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Segarkan
                        </button>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FiPlus className="w-4 h-4" />
                            Tambah Produk
                        </button>
                    </div>
                </div>

                <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
                    <MiniStat icon={FiBox} label="Total Produk" value={pagination.total} color="text-emerald-400" />
                    <MiniStat icon={FiPackage} label="Produk Halaman Ini" value={products.length} color="text-teal-400" />
                    <MiniStat icon={FiCheckCircle} label="Produk Aktif (Hal)" value={stats.pageActiveCount} color="text-cyan-400" />
                    <MiniStat icon={FiTrendingUp} label="Proses Manual (Hal)" value={stats.pageManualCount} color="text-green-400" />
                </div>
            </div>

            {/* ==================== FILTER BAR ==================== */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-white/5 p-5">
                <div className="flex flex-col gap-4">
                    {/* Row 1: Search + Brand + Category */}
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md w-full">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-500/10 rounded-lg">
                                <FiSearch className="text-blue-500 h-4 w-4" />
                            </div>
                            <Input
                                placeholder="Cari produk berdasarkan nama atau SKU..."
                                value={searchInput}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-14 pr-4 h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Brand Filter */}
                        <div className="w-full sm:w-56">
                            <Select
                                value={params.brandId || "__all__"}
                                onValueChange={(v) => setFilter("brandId", v === "__all__" ? undefined : v)}
                            >
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                            <FiFilter className="text-blue-500 h-3.5 w-3.5" />
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
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                            <FiLayers className="text-indigo-500 h-3.5 w-3.5" />
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
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
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
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
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
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
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
                            className="h-12 px-5 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-sm gap-2 transition-all"
                        >
                            <FiFilter className="h-4 w-4" />
                            Reset Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* ==================== TABLE ==================== */}
            <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                            <FiLayers className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Daftar Produk</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total {pagination.total} produk ditemukan</p>
                        </div>
                    </div>
                </div>

                <div>
                    <Table>
                        <TableHeader className="overflow-visible">
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                                <TableHead className="w-16 text-center font-bold text-xs uppercase tracking-wider">No</TableHead>
                                <TableHead
                                    className="font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => setSort('name')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Produk
                                        <SortIcon field="name" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">SKU</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">Supplier</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">Brand</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">Kategori</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">Tipe</TableHead>
                                <TableHead
                                    className="font-bold text-xs uppercase tracking-wider text-right cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => setSort('basePrice')}
                                >
                                    <div className="flex items-center justify-end gap-1.5">
                                        Harga
                                        <SortIcon field="basePrice" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => setSort('stock')}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        Stok
                                        <SortIcon field="stock" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-center pl-12">Aksi</TableHead>
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
                                            className="group hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors overflow-visible"
                                        >
                                            <TableCell className="text-center text-xs font-medium text-gray-400">
                                                {rowNum}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">{product.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                {product.skuCode ? (
                                                    <code className="text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 font-mono text-blue-500 font-medium border border-gray-200 dark:border-white/10">
                                                        {product.skuCode}
                                                    </code>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 rounded-lg font-mono font-bold text-blue-500">
                                                    {product.supplierCode}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-750 dark:text-gray-300">{product.brand?.name || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const catName = product.category?.name || 'Other';
                                                    const catColor = getCategoryColor(catName);
                                                    return (
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border"
                                                            style={{
                                                                backgroundColor: `${catColor}15`,
                                                                color: catColor,
                                                                borderColor: `${catColor}30`
                                                            }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }}></span>
                                                            {catName}
                                                        </span>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-750 dark:text-gray-300">{toStr(product.type) || '-'}</span>
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
                                                                <span className="text-[10px] text-blue-500 font-medium">{tierCount} tier</span>
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
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            <FiCheckCircle className="h-3 w-3" /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                                            <FiCircle className="h-3 w-3" /> Nonaktif
                                                        </span>
                                                    )}
                                                    {product.isManualProcess && (
                                                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            Manual
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1 pr-4">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(product)}
                                                        className="w-9 h-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleViewDetail(product)}
                                                        className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeleteTarget(product)}
                                                        className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </Button>
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
                                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                                <FiPackage className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tidak Ada Produk Ditemukan</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                                    Tidak ada produk yang sesuai dengan filter saat ini. Coba ubah filter atau tambahkan produk baru.
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-3">
                                                <Button variant="outline" onClick={resetFilters} className="rounded-xl text-sm h-11 px-5">
                                                    <FiFilter className="mr-2 h-4 w-4" /> Reset Filter
                                                </Button>
                                                <Button onClick={handleAdd} className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-xl text-sm h-11 px-5">
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
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="text-gray-900 dark:text-white">{pagination.total}</span> produk
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => setPage(pagination.page - 1)}
                                className="h-9 px-4 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                Sebelumnya
                            </Button>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <span className="text-xs font-bold text-blue-500">{pagination.page}</span>
                                <span className="text-[10px] text-gray-400">/</span>
                                <span className="text-xs font-bold text-gray-500">{pagination.totalPages || 1}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPage(pagination.page + 1)}
                                className="h-9 px-4 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== DELETE DIALOG ==================== */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
                                <FiTrash2 className="w-5 h-5" />
                            </div>
                            Hapus Produk
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                            <p className="text-gray-900 dark:text-white font-bold">Apakah Anda yakin ingin menghapus produk ini?</p>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Tindakan ini <span className="text-red-500 font-bold">permanen</span> dan data transaksi yang terhubung mungkin akan terpengaruh.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending} className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold">
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 transition-all"
                        >
                            {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== DETAIL DIALOG ==================== */}
            <Dialog open={!!detailProduct} onOpenChange={(open) => { if (!open) { setDetailProduct(null); setDetailId(null); } }}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                                <FiEye className="w-5 h-5" />
                            </div>
                            Detail Produk
                        </DialogTitle>
                    </DialogHeader>
                    {detailProduct && (
                        <div className="space-y-6 py-4 text-sm">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <FiPackage className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Nama Produk</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{detailProduct.name}</p>
                                    <p className="text-xs font-mono text-blue-500">{detailProduct.skuCode || 'Tanpa SKU'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">Brand</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{detailProduct.brand?.name || '-'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Kategori</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{toStr(detailProduct.category)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Harga (Base)</p>
                                    <p className="text-sm font-black text-emerald-500">{detailProduct.basePrice ? safeFormatRupiah(detailProduct.basePrice) : '-'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Tipe</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{toStr(detailProduct.type)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Stok / Terjual</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{detailProduct.stock ?? '-'} / {detailProduct.sold ?? '0'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Proses</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{detailProduct.isManualProcess ? 'Manual' : 'Otomatis'}</p>
                                </div>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Rincian Harga Tier</h4>
                                    {isLoadingViewDetail && (
                                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </div>
                                {detailProduct.productPricing && detailProduct.productPricing.length > 0 ? (
                                    <div className="space-y-2">
                                        {detailProduct.productPricing.map((tier, i) => (
                                            <div key={tier.tierCode || i} className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 font-mono">{tier.tierCode}</span>
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{safeFormatRupiah(tier.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <FiDollarSign className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Belum ada data harga tier</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => { setDetailProduct(null); setDetailId(null); }} className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== CREATE / EDIT DIALOG ==================== */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm(); } }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className={`p-2 rounded-lg ${editId ? 'bg-blue-500/15 text-blue-500' : 'bg-indigo-500/15 text-indigo-500'}`}>
                                {editId ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                            </div>
                            {editId ? 'Edit' : 'Tambah'} Produk
                        </DialogTitle>
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
                            const disabledCls = "h-12 rounded-xl border-gray-100 dark:border-white/10 bg-gray-105 dark:bg-gray-800/60 opacity-60 cursor-not-allowed text-sm";
                            const normalCls = "h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm";
                            return (
                                <>
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Informasi Dasar</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Nama Produk *</label>
                                                <Input required disabled={isLimited} value={formValues.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nama produk" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">SKU Code</label>
                                                <Input value={formValues.skuCode} onChange={(e) => setField("skuCode", e.target.value)} placeholder="Opsional" className={`${normalCls} ${formError?.includes('SKU') ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Supplier Code *</label>
                                                <Input required disabled={isLimited} value={formValues.supplierCode} onChange={(e) => setField("supplierCode", e.target.value)} placeholder="Wajib diisi" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Kategori *</label>
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
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Brand *</label>
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
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Tipe *</label>
                                                <Input required disabled={isLimited} value={formValues.type} onChange={(e) => setField("type", e.target.value)} placeholder="e.g. Top Up" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Base Price</label>
                                                <Input type="number" min="0" disabled={isLimited} value={formValues.basePrice} onChange={(e) => setField("basePrice", e.target.value)} placeholder="0" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ==================== PRICING TIERS ==================== */}
                                    {editId ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Harga per Tier</h4>
                                                {isLimited && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">Read Only</span>
                                                )}
                                            </div>

                                            {pricingRows.length > 0 ? (
                                                <div className="space-y-3">
                                                    {pricingRows.map((row, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 w-6">
                                                                <span className="font-bold">#{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <label className="text-xs text-gray-500">Tier Code</label>
                                                                <Input
                                                                    value={row.tierCode}
                                                                    disabled
                                                                    className="h-10 rounded-lg border-gray-100 dark:border-white/10 bg-gray-100 dark:bg-gray-800/60 text-sm opacity-70 cursor-not-allowed font-mono"
                                                                />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <label className={`text-xs ${!isLimited ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                                                                    Harga (Rp) {!isLimited && <span className="text-blue-500">(editable)</span>}
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    disabled={isLimited}
                                                                    value={row.price}
                                                                    onChange={(e) => updatePricingRow(index, "price", e.target.value)}
                                                                    placeholder="0"
                                                                    className={isLimited
                                                                        ? "h-10 rounded-lg border-gray-100 dark:border-white/10 bg-gray-100 dark:bg-gray-800/60 text-sm opacity-70 cursor-not-allowed"
                                                                        : "h-10 rounded-lg bg-white dark:bg-gray-900 text-sm border border-blue-500/30 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-250 dark:border-white/10">
                                                    <FiDollarSign className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {isLoadingDetail ? 'Memuat data harga...' : 'Belum ada tier harga dari backend'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Harga per Tier</h4>
                                            <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-dashed border-blue-200 dark:border-blue-800">
                                                <FiDollarSign className="h-6 w-6 text-blue-400 dark:text-blue-600 mx-auto mb-2" />
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Tier harga akan otomatis dibuat oleh sistem</p>
                                                <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">Anda dapat mengatur harga setelah produk dibuat</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock & Status */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Stock & Status</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Stock</label>
                                                <Input type="number" disabled={isLimited} value={formValues.stock} onChange={(e) => setField("stock", e.target.value)} placeholder="Opsional" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Terjual</label>
                                                <Input type="number" disabled={isLimited} value={formValues.sold} onChange={(e) => setField("sold", e.target.value)} placeholder="Opsional" className={isLimited ? disabledCls : normalCls} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={formValues.productStatus} onChange={(e) => setField("productStatus", e.target.checked)} className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isLimited ? 'ring-2 ring-blue-500/30' : ''}`} />
                                                <span className={`text-sm ${isLimited ? 'text-blue-750 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>Produk Aktif {isLimited && <span className="text-xs font-normal text-blue-600 dark:text-blue-400">(editable)</span>}</span>
                                            </label>
                                        </div>
                                    </div>
                                </>);
                        })()}

                        <DialogFooter className="gap-2 sm:gap-0 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setFormOpen(false); resetForm(); }}
                                className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 h-11 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : editId ? 'Simpan Perubahan' : 'Tambah Produk'}
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
