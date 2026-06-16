"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getCategoryName = (category: string | CategoryObject): string => {
    return typeof category === 'object' && category !== null ? category.name : category;
};

const getPublisherName = (publisher: string | PublisherObject): string => {
    return typeof publisher === 'object' && publisher !== null ? publisher.name : publisher || '-';
};

import { fetchBrands, createBrand, updateBrand, deleteBrand, Brand, CategoryObject, PublisherObject } from "@/services/brand.client";
import { fetchCategories } from "@/services/category.client";
import { fetchPricingTiers } from "@/services/pricingTier.client";
import { Category } from "@/types/category.types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiPackage,
    FiLayers, FiTag, FiChevronLeft, FiChevronRight, FiX,
    FiCheckCircle, FiInfo, FiRefreshCw, FiActivity,
    FiTrendingUp, FiBox, FiLoader
} from "react-icons/fi";
import Image from "next/image";

import { useAuthSession } from "@/hooks/useAuthSession";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";


/* ─── Helpers ───────────────────────────────────────────────────────────── */
function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
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



// Extend Brand shape to include optional categoryId when present from API
type BrandWithCategoryId = Brand & { categoryId?: string };

// Default colors for categories
const defaultCategoryColors: { [key: string]: string } = {
    'game': '#3b82f6',      // Blue
    'games': '#3b82f6',     // Same as Game for consistency
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

// Helper function to get color based on category name
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

// Resolve category name from mixed sources (object/string/categoryId)
const resolveCategoryName = (
    category: string | CategoryObject | undefined,
    categoryId: string | undefined,
    categoriesList: Category[]
): string => {
    if (typeof category === 'object' && category) return category.name;
    if (typeof category === 'string' && category) return category;
    if (categoryId) {
        const match = categoriesList.find(c => String(c.id) === String(categoryId));
        if (match) return match.name;
    }
    return 'Other';
};

export default function BrandTable() {
    const queryClient = useQueryClient();
    const { data: session, isPending } = useAuthSession({
        redirectTo: "/auth/login",
        requireAdmin: true,
    });
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);


    // Fetch Brands using React Query
    const { data: brands = [], isLoading, error: brandsError, isFetching } = useQuery({
        queryKey: ['brands'],
        queryFn: fetchBrands,
    });

    // Fetch Categories using React Query
    const { data: categoriesData = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const categories: Category[] = React.useMemo(() => {
        if (!isLoadingCategories && categoriesData) {
            console.log("categoriesData : ", categoriesData);
            return categoriesData.map((cat: Category) => ({
                ...cat,
                color: cat.color || getCategoryColor(cat.name)
            }));
        }
        // Fallback defaults
        if (categoriesError) {
            // Note: Types need to match string ID now, but for fallback mocking we use consistent types
            return [] as Category[];
        }
        return [] as Category[];
    }, [categoriesData, categoriesError, isLoadingCategories]);

    // Fetch Pricing Tiers using React Query
    const { data: pricingTiers = [], isLoading: isLoadingPricingTiers } = useQuery({
        queryKey: ['pricingTiers'],
        queryFn: fetchPricingTiers,
    });

    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [publisher, setPublisher] = useState("");
    const [logo, setLogo] = useState("");
    const [sortOrder, setSortOrder] = useState<number | null>(null);
    const [profitMethod, setProfitMethod] = useState("MARGIN");
    const [margins, setMargins] = useState<{ tierId: string, percentage: number }[]>([]);
    const [isManualProcess, setIsManualProcess] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const rowsPerPage = 5;


    const stats = React.useMemo(() => {
        const totalProducts = brands.reduce((acc, b) => acc + (b._count?.products || 0), 0);
        const activeCount = brands.filter(b => b.isActive).length;
        const topBrand = [...brands].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))[0];
        const avgProducts = brands.length > 0 ? (totalProducts / brands.length).toFixed(1) : 0;

        return { totalProducts, activeCount, topBrand, avgProducts };
    }, [brands]);

    // Filter & pagination
    const filteredBrands = React.useMemo(() =>
        brands.filter(brand =>
            search ? brand.name.toLowerCase().includes(search.toLowerCase()) : true
        ), [brands, search]);

    const totalPage = Math.ceil(filteredBrands.length / rowsPerPage);
    const paginatedBrands = React.useMemo(() =>
        filteredBrands.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        [filteredBrands, page, rowsPerPage]);
    const createMutation = useMutation({
        mutationFn: createBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setOpen(false);
        },
        onError: (err) => {
            setFormError(err instanceof Error ? err.message : 'Gagal membuat brand baru');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Brand> }) => updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setOpen(false);
        },
        onError: (err) => {
            setFormError(err instanceof Error ? err.message : 'Gagal memperbarui brand');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setIsDeleteOpen(false);
        },
        onError: (err) => {
            setFormError(err instanceof Error ? err.message : 'Gagal menghapus brand');
        }
    });

    const handleToggleActive = async (brandItem: Brand) => {
        const newStatus = !(brandItem.isActive ?? true);
        try {
            await updateMutation.mutateAsync({
                id: brandItem.id,
                data: { isActive: newStatus }
            });
            toast.success(`Brand ${brandItem.name} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (err) {
            toast.error("Gagal memperbarui status brand");
        }
    };

    // Check where error is used. 
    // It is used in the main render "if (error)" and also in the dialogs?
    // In original code:
    // "if (error)" -> main full page error.
    // In Dialog: "{error && ...}"

    // I need to separate main page error from form error.
    // brandsError -> main page.
    // formError -> dialogs.


    const detailBrand = detailId ? brands.find(brand => brand.id === detailId) : null;

    console.log("paginatedBrands : ", paginatedBrands);

    if (isLoading && brands.length === 0) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-6">
                    {/* Animated Logo Loader */}
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-sky-500 to-indigo-500 rounded-2xl animate-pulse opacity-20"></div>
                            <div className="absolute inset-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                                <FiPackage className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 via-sky-500/20 to-indigo-500/20 rounded-3xl blur-xl animate-pulse"></div>
                        </div>
                        {/* Floating dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Memuat Data Brand
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sedang mengambil data dari server...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (brandsError) {
        return (
            <div className="min-h-[500px] flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-2xl"></div>

                    {/* Card */}
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-800/50 p-8 shadow-xl">
                        <div className="text-center space-y-6">
                            {/* Animated error icon */}
                            <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 bg-linear-to-br from-red-500 to-orange-500 rounded-2xl animate-pulse opacity-20"></div>
                                <div className="absolute inset-2 bg-linear-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <FiX className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Oops! Terjadi Kesalahan</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{(brandsError as Error).message}</p>
                            </div>

                            <Button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['brands'] })}
                                className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Muat Ulang
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleEdit = (brandItem: Brand) => {
        setEditId(brandItem.id);
        setName(brandItem.name || "");
        setBrand(brandItem.code || "");
        // Prefer categoryId from payload, otherwise derive from category object/name
        const catIdFromPayload = (brandItem as BrandWithCategoryId).categoryId;
        if (catIdFromPayload) {
            setCategory(catIdFromPayload);
        } else if (typeof brandItem.category === 'object' && brandItem.category) {
            setCategory(String(brandItem.category.id));
        } else if (typeof brandItem.category === 'string' && brandItem.category) {
            const catName = getCategoryName(brandItem.category).toLowerCase();
            const match = categories.find(c => c.name.toLowerCase() === catName);
            setCategory(match ? String(match.id) : "");
        } else {
            setCategory("");
        }
        setPublisher(getPublisherName(brandItem.publisher));
        setLogo(brandItem.logo || "");
        setSortOrder(brandItem.sortOrder ?? null);
        setProfitMethod(brandItem.profitMethod || "MARGIN");
        setMargins(brandItem.margins || []);
        setIsManualProcess(brandItem.isManualProcess || false);
        setIsActive(brandItem.isActive ?? true);
        setOpen(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setFormError(null);
        setName("");
        setBrand("");
        setCategory("");
        setPublisher("");
        setLogo("");
        setSortOrder(null);
        setProfitMethod("MARGIN");
        setMargins([]);
        setIsManualProcess(false);
        setIsActive(true);
        setOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            if (editId) {
                // Update existing brand
                await updateMutation.mutateAsync({
                    id: editId,
                    data: {
                        name,
                        code: brand,
                        categoryId: category || undefined,
                        publisher,
                        logo: logo || undefined,
                        sortOrder: sortOrder,
                        profitMethod,
                        margins: profitMethod === 'MARGIN' ? margins : undefined,
                        isManualProcess,
                        isActive,
                    }
                });
            } else {
                // Create new brand
                const brandCode = brand || name.toLowerCase().replace(/\s+/g, '-');
                await createMutation.mutateAsync({
                    name,
                    code: brandCode,
                    categoryId: category, // category holds selected categoryId
                    publisher: publisher || "-",
                    logo: logo || undefined,
                    sortOrder: sortOrder,
                    profitMethod,
                    margins: profitMethod === 'MARGIN' ? margins : undefined,
                    isManualProcess,
                    isActive,
                });
            }
        } catch (err) {
            // Error is handled in onError of mutation, but mutateAsync creates a promise 
            // that rejects. We need to catch it here if we want to prevent bubbling, 
            // but logic inside mutation onError handles the state.
            // Actually if using mutateAsync, we should catch here or let it bubble?
            console.error(err);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutateAsync(deleteId);

            // Pagination fix logic might be needed if we delete the last item on page
            // But we can depend on "filteredBrands" length recalculation on next render
            // However, brands array is not updated synchronously.
            // If we rely on automatic refetch, the page might temporarily show empty?
            // "page > maxPage" logic was here:
            /*
            const newBrands = brands.filter(b => b.id !== deleteId);
             const maxPage = Math.ceil(newBrands.length / rowsPerPage) || 1;
             if (page > maxPage) {
                 setPage(maxPage);
             }
            */
            // With React Query invalidation, checking this might be trickier without immediate state. 
            // But since delete implies -1 item, we can check.
            const newLength = brands.length - 1;
            const maxPage = Math.ceil(newLength / rowsPerPage) || 1;
            if (page > maxPage) {
                setPage(maxPage);
            }

        } catch (err) {
            console.error("Error deleting", err);
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#091d3a_45%,#0d172e_100%)] shadow-[0_20px_80px_rgba(59,130,246,0.08)] p-8">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <LiveDot />
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Brand Global</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            Manajemen
                            <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent ml-3">
                                Brand
                            </span>
                        </h1>
                        <p className="text-slate-600 dark:text-blue-200/70 mt-3 text-base max-w-md">
                            Kelola koleksi brand, integrasi kategori, dan pantau stok produk secara real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['brands'] })}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium border border-slate-200 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Segarkan
                        </button>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FiPlus className="w-4 h-4" />
                            Tambah Brand
                        </button>
                    </div>
                </div>

                <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
                    <MiniStat icon={FiBox} label="Total Brand" value={brands.length} color="text-blue-400" />
                    <MiniStat icon={FiPackage} label="Total Produk" value={stats.totalProducts} color="text-indigo-400" />
                    <MiniStat icon={FiCheckCircle} label="Brand Aktif" value={stats.activeCount} color="text-emerald-400" />
                    <MiniStat icon={FiTrendingUp} label="Top Brand" value={stats.topBrand?.name || "-"} color="text-violet-400" />
                </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 gap-6">

                {/* Table Card */}
                <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">

                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                                <FiLayers className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Daftar Brand</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total {filteredBrands.length} brand ditemukan</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                value={search || ""}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari brand..."
                                className="pl-10 w-full md:w-64 h-10 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                                    <TableHead className="w-16 text-center font-bold text-xs uppercase tracking-wider">No</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-xs uppercase tracking-wider">Logo</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider min-w-[150px]">Brand</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Kode</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Publisher</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider min-w-[120px] pl-4">Tipe</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Kategori</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Metode</TableHead>
                                    {/* <TableHead className="font-bold text-xs uppercase tracking-wider">Profit</TableHead> */}
                                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider pl-12">Aksi</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBrands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                                                    <FiPackage className="text-3xl text-gray-300" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">Tidak ada brand ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedBrands.map((brand, idx) => {
                                        const catNameResolved = brand?.category
                                            ? resolveCategoryName(
                                                brand.category as string | CategoryObject | undefined,
                                                (brand as BrandWithCategoryId).categoryId,
                                                categories
                                            )
                                            : 'Tanpa Kategori';

                                        return (
                                            <TableRow key={brand.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors">
                                                <TableCell className="text-center text-xs font-medium text-gray-400">
                                                    {(page - 1) * rowsPerPage + idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center">
                                                        {brand.logo ? (
                                                            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white p-1">
                                                                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                                <FiBox className="text-gray-400 w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="py-1">
                                                        <p className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors whitespace-nowrap tracking-tight">{brand.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium tracking-tight truncate max-w-[200px] mt-0.5">ID: {brand.id}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md font-mono font-medium text-blue-500">
                                                        {brand.code}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">{getPublisherName(brand.publisher)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {brand.types && brand.types.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                            {brand.types.map(t => (
                                                                <span key={t.id} className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/5 text-blue-500 border border-blue-500/10">
                                                                    {t.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Tanpa tipe</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border"
                                                        style={{
                                                            backgroundColor: `${getCategoryColor(catNameResolved)}15`,
                                                            color: getCategoryColor(catNameResolved),
                                                            borderColor: `${getCategoryColor(catNameResolved)}30`
                                                        }}
                                                    >
                                                        {catNameResolved}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md border ${brand.profitMethod === 'PERCENTAGE' || brand.profitMethod === 'MARGIN'
                                                        ? 'bg-violet-500/10 text-violet-500 border-violet-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        }`}>
                                                        {brand.profitMethod || '-'}
                                                    </span>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        {brand.profitMethod === 'MARGIN' && brand.margins && brand.margins.length > 0 ? (
                                                            brand.margins.slice(0, 2).map((m, idx) => {
                                                                const tierName = pricingTiers.find(pt => String(pt.id) === String(m.tierId))?.name || `T${m.tierId}`;
                                                                return (
                                                                    <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                                                                        <span className="text-gray-400 uppercase font-semibold tracking-tighter text-[10px]">{tierName.substring(0, 3)}</span>
                                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{m.percentage}%</span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </TableCell> */}
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={brand.isActive}
                                                        onCheckedChange={() => handleToggleActive(brand)}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex justify-end gap-1 pr-4">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(brand)}
                                                            className="w-9 h-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => setDetailId(brand.id)}
                                                            className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"
                                                        >
                                                            <FiEye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(brand.id)}
                                                            className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-gray-900 dark:text-white">{(page - 1) * rowsPerPage + 1}</span> - <span className="text-gray-900 dark:text-white">{(page - 1) * rowsPerPage + paginatedBrands.length}</span> dari <span className="text-gray-900 dark:text-white">{filteredBrands.length}</span> brand
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="h-9 px-4 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                Sebelumnya
                            </Button>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <span className="text-xs font-bold text-blue-500">{page}</span>
                                <span className="text-[10px] text-gray-400">/</span>
                                <span className="text-xs font-bold text-gray-500">{totalPage || 1}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPage || totalPage === 0}
                                onClick={() => setPage(p => p + 1)}
                                className="h-9 px-4 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
                                <FiTrash2 className="w-5 h-5" />
                            </div>
                            Hapus Brand
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                            <p className="text-gray-900 dark:text-white font-bold">Apakah Anda yakin ingin menghapus brand ini?</p>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Tindakan ini <span className="text-red-500 font-bold">permanen</span> dan data produk yang terhubung mungkin akan terpengaruh.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending} className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold">
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

            {/* Modal Tambah/Edit Brand */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className={`p-2 rounded-lg ${editId ? 'bg-blue-500/15 text-blue-500' : 'bg-indigo-500/15 text-indigo-500'}`}>
                                {editId ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                            </div>
                            {editId ? 'Edit' : 'Tambah'} Brand
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Nama Brand</label>
                                <Input
                                    value={name || ""}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Mobile Legends"
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Kode Brand</label>
                                <Input
                                    value={brand || ""}
                                    onChange={e => setBrand(e.target.value)}
                                    placeholder="e.g. mlbb"
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Publisher</label>
                                <Input
                                    value={publisher || ""}
                                    onChange={e => setPublisher(e.target.value)}
                                    placeholder="e.g. Moonton"
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Kategori</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all text-sm text-gray-900 dark:text-white appearance-none"
                                    required
                                >
                                    <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={String(cat.id)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>


                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Logo URL</label>
                            <Input
                                value={logo || ""}
                                onChange={e => setLogo(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Urutan / Prioritas (Optional)</label>
                            <Input
                                type="number"
                                min={0}
                                value={sortOrder ?? ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setSortOrder(val === '' ? null : parseInt(val, 10));
                                }}
                                placeholder="e.g. 1 (semakin kecil semakin atas)"
                                className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <p className="text-[10px] text-gray-400 ml-1">Angka kecil tampil lebih atas di Telegram Bot. Kosongkan jika tidak perlu prioritas.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-white">Proses Manual</p>
                                    <p className="text-[10px] text-gray-400">Centang jika transaksi diproses manual</p>
                                </div>
                                <Switch checked={isManualProcess} onCheckedChange={setIsManualProcess} />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                <div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-white">Status Aktif</p>
                                    <p className="text-[10px] text-gray-400">Aktifkan brand di halaman publik</p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </div>

                        {formError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-shake">
                                <FiActivity className="w-4 h-4" />
                                {formError}
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={createMutation.isPending || updateMutation.isPending}
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
                                ) : 'Simpan Brand'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Detail Brand */}
            <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                                <FiEye className="w-5 h-5" />
                            </div>
                            Detail Brand
                        </DialogTitle>
                    </DialogHeader>
                    {detailBrand && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white p-2 border border-gray-100 dark:border-white/10">
                                    {detailBrand.logo ? (
                                        <Image src={detailBrand.logo} alt={detailBrand.name} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <FiBox className="text-2xl text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Nama Brand</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{detailBrand.name}</p>
                                    <p className="text-xs font-mono text-blue-500">{detailBrand.code}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">Kategori</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {resolveCategoryName(detailBrand.category as any, (detailBrand as any).categoryId, categories)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Publisher</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{getPublisherName(detailBrand.publisher)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Total Produk</p>
                                    <p className="text-2xl font-black text-emerald-500">{detailBrand._count?.products || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Tipe Produk</p>
                                    <p className="text-2xl font-black text-amber-500">{detailBrand._count?.types || 0}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Urutan Prioritas</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {detailBrand.sortOrder != null ? `#${detailBrand.sortOrder}` : 'Tidak diatur'}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailId(null)} className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    );
}
