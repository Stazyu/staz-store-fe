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
import { Category } from "@/types/category";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiPackage, FiLayers, FiTag, FiChevronLeft, FiChevronRight, FiX, FiCheckCircle, FiInfo } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import Image from "next/image";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";


// Extend Brand shape to include optional categoryId when present from API
type BrandWithCategoryId = Brand & { categoryId?: string };

// Default colors for categories
const defaultCategoryColors: { [key: string]: string } = {
    'Game': '#3b82f6',      // Blue
    'Games': '#3b82f6',     // Same as Game for consistency
    'Pulsa': '#10b981',     // Emerald
    'Data': '#06b6d4',      // Cyan
    'Voucher': '#ec4899',   // Pink
    'E-Money': '#8b5cf6',   // Violet
    'PLN': '#f59e0b',       // Amber
    'Other': '#6b7280'      // Gray
};

// Helper function to get color based on category name
const getCategoryColor = (categoryName: string): string => {
    return defaultCategoryColors[categoryName] || '#6b7280';
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
    const { data: brands = [], isLoading, error: brandsError } = useQuery({
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

    // Chart dummy: jumlah produk per brand
    // const chartData = brands.map(brand => ({
    //     name: brand.name,
    //     value: Math.floor(Math.random() * 10) + 1
    // }));

    // Mutations
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


    // Filter & pagination
    const filteredBrands = brands.filter(brand =>
        search ? brand.name.toLowerCase().includes(search.toLowerCase()) : true
    );
    const paginatedBrands = filteredBrands.slice((page - 1) * rowsPerPage, page * rowsPerPage);
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
        setName(brandItem.name);
        setBrand(brandItem.code);
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
        <div className="space-y-6">
            {/* Header Section - Premium Design */}
            <div className="relative overflow-hidden rounded-3xl">
                {/* Background with glassmorphism */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

                {/* Floating decorative elements */}
                <div className="absolute top-4 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-20 w-32 h-32 bg-sky-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-indigo-300/15 rounded-full blur-xl"></div>

                <div className="relative px-8 py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <FiPackage className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                        Kelola Brand
                                    </h1>
                                    <p className="text-blue-100 text-base mt-1">
                                        Kelola dan pantau semua brand yang tersedia
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Stats card */}
                            <div className="hidden md:flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FiLayers className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-violet-200">Total Brand</p>
                                    <p className="text-xl font-bold text-white">{brands.length}</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleAdd}
                                className="bg-white hover:bg-gray-50 text-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <HiOutlineSparkles className="h-5 w-5" />
                                Tambah Brand
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters - Modern Card */}
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-lg">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-linear-to-br from-blue-100 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg">
                            <FiSearch className="text-blue-600 dark:text-blue-400 h-4 w-4" />
                        </div>
                        <Input
                            placeholder="Cari brand berdasarkan nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-4 py-3 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Filter info badge */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                            <FiTag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Menampilkan <span className="font-bold text-blue-600 dark:text-blue-400">{filteredBrands.length}</span> brand
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section - Modern Card Design */}
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                {/* Table Header Bar */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-linear-to-r from-gray-50/80 to-gray-50/40 dark:from-gray-800/80 dark:to-gray-800/40">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-linear-to-br from-blue-500 to-indigo-500 rounded-lg">
                            <FiLayers className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Daftar Brand</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-linear-to-r from-blue-50/50 via-sky-50/30 to-indigo-50/50 dark:from-blue-900/10 dark:via-sky-900/10 dark:to-indigo-900/10 hover:from-blue-50/50 hover:via-sky-50/30 hover:to-indigo-50/50 dark:hover:from-blue-900/10 dark:hover:via-sky-900/10 dark:hover:to-indigo-900/10 border-b border-gray-100 dark:border-gray-700/50">
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 py-4 text-xs uppercase tracking-wider w-[50px] text-center">No</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider w-[80px] text-center">Logo</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Nama Brand</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Kode</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Publisher</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider pl-6 w-[120px]">Tipe</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Kategori</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Metode</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Profit</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider text-center">Status</TableHead>
                                <TableHead className="font-bold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedBrands.map((brand, index) => {
                                if (!brand) return null;
                                const catNameResolved = brand?.category
                                    ? resolveCategoryName(
                                        brand.category as string | CategoryObject | undefined,
                                        (brand as BrandWithCategoryId).categoryId,
                                        categories
                                    )
                                    : 'No Category';
                                return (
                                    <TableRow
                                        key={brand.id}
                                        className="group hover:bg-linear-to-r hover:from-blue-50/30 hover:via-sky-50/20 hover:to-indigo-50/30 dark:hover:from-blue-900/5 dark:hover:via-sky-900/5 dark:hover:to-indigo-900/5 transition-all duration-300 border-b border-gray-50 dark:border-gray-800"
                                    >
                                        <TableCell className="py-4 text-center">
                                            <div className="w-8 h-8 mx-auto flex items-center justify-center bg-linear-to-br from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 rounded-lg text-sm font-bold text-blue-700 dark:text-blue-300">
                                                {index + 1 + (page - 1) * rowsPerPage}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {brand?.logo ? (
                                                    <div className="relative group/logo">
                                                        <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-hover/logo:opacity-40 transition-opacity duration-300"></div>
                                                        <Image
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            width={48}
                                                            height={48}
                                                            className="relative h-12 w-12 object-contain rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-1"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                                                        <FiPackage className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{brand?.name}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">Brand ID: {brand?.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-linear-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 px-3 py-1.5 rounded-lg font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                {brand?.code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{getPublisherName(brand?.publisher)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {brand?.types && brand.types.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {brand.types.map(t => (
                                                        <span key={t.id} className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold rounded-full bg-linear-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">Belum ada type</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border"
                                                style={{
                                                    backgroundColor: `${getCategoryColor(catNameResolved)}15`,
                                                    color: getCategoryColor(catNameResolved),
                                                    borderColor: `${getCategoryColor(catNameResolved)}30`
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: getCategoryColor(catNameResolved) }}
                                                ></span>
                                                {catNameResolved}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${brand.profitMethod === 'PERCENTAGE' || brand.profitMethod === 'MARGIN'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                                                }`}>
                                                {brand.profitMethod || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 max-w-[150px]">
                                                {brand.profitMethod === 'MARGIN' && brand.margins && brand.margins.length > 0 ? (
                                                    brand.margins.map((m, idx) => {
                                                        const tierName = pricingTiers.find(pt => String(pt.id) === String(m.tierId))?.name || `T${m.tierId}`;
                                                        const shortName = tierName.substring(0, 1).toUpperCase();
                                                        return (
                                                            <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                                                <span className="w-3" title={tierName}>{shortName}</span>
                                                                <span className="font-medium text-gray-700 dark:text-gray-300 shrink-0">
                                                                    {m.percentage} %
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={brand.isActive}
                                                    onCheckedChange={() => handleToggleActive(brand)}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-center">
                                                <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <Button
                                                        title="Lihat Detail"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDetailId(brand.id)}
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                                                    >
                                                        <FiEye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        title="Edit"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(brand)}
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                                                    >
                                                        <FiEdit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        title="Hapus"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(brand.id)}
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section - Modern Design */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-linear-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/80 dark:to-gray-900/50 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FiLayers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {(() => {
                                const startItem = (page - 1) * rowsPerPage + 1;
                                const endItem = Math.min(page * rowsPerPage, filteredBrands.length);
                                const totalItems = filteredBrands.length;

                                if (totalItems === 0) {
                                    return <span className="text-gray-400 dark:text-gray-500">Tidak ada brand ditemukan</span>;
                                }

                                return (
                                    <>
                                        Menampilkan <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}-{endItem}</span> dari <span className="font-bold text-gray-900 dark:text-gray-100">{totalItems}</span> brand
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Page indicator */}
                        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Halaman</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{page}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">dari</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{Math.max(1, Math.ceil(filteredBrands.length / rowsPerPage))}</span>
                        </div>

                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-9 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <FiChevronLeft className="h-4 w-4 mr-1" />
                                <span className="text-sm">Prev</span>
                            </Button>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * rowsPerPage >= filteredBrands.length}
                                className="h-9 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <span className="text-sm">Next</span>
                                <FiChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="space-y-1 text-left">
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Hapus Brand
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 dark:text-gray-400">
                                    Apakah Anda yakin ingin menghapus brand ini? Tindakan ini tidak dapat dibatalkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="w-full sm:w-auto rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Brand'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[640px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl">
                    <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20">
                                {editId ? <FiEdit2 className="h-5 w-5 text-white" /> : <FiPlus className="h-5 w-5 text-white" />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {editId ? 'Edit Brand' : 'Tambah Brand Baru'}
                                </DialogTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {editId ? 'Perbarui informasi brand' : 'Buat brand baru dengan lengkap'}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 pt-4">
                        {formError && (
                            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                                    <FiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <span>{formError}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <FiPackage className="h-3.5 w-3.5 text-blue-500" />
                                    Nama Brand
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Mobile Legends"
                                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <FiTag className="h-3.5 w-3.5 text-blue-500" />
                                    Kode Brand
                                </label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="Contoh: ml"
                                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Publisher
                                </label>
                                <Input
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                    placeholder="Contoh: Moonton"
                                    className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                                    required
                                    disabled={isLoadingCategories}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {isLoadingPricingTiers ? (
                                        <option value="" disabled>Memuat kategori...</option>
                                    ) : categoriesError ? (
                                        <option value="" disabled>Gagal memuat kategori</option>
                                    ) : (
                                        categories.map((cat) => (
                                            <option key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-4 pt-2">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        Metode Profit <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setProfitMethod("FIXED")}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${profitMethod === "FIXED"
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                        >
                                            <div className={`shrink-0 rounded-full w-5 h-5 border-2 flex items-center justify-center ${profitMethod === "FIXED" ? "border-blue-500" : "border-gray-400"
                                                }`}>
                                                {profitMethod === "FIXED" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                            <span className={`font-medium ${profitMethod === "FIXED" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                                                }`}>Harga Tetap</span>
                                        </div>

                                        <div
                                            onClick={() => setProfitMethod("MARGIN")}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${profitMethod === "MARGIN"
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                        >
                                            <div className={`shrink-0 rounded-full w-5 h-5 border-2 flex items-center justify-center ${profitMethod === "MARGIN" ? "border-blue-500" : "border-gray-400"
                                                }`}>
                                                {profitMethod === "MARGIN" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                            <span className={`font-medium ${profitMethod === "MARGIN" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                                                }`}>Gunakan Margin (%)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${isManualProcess ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                            }`}
                                        onClick={() => setIsManualProcess(!isManualProcess)}
                                    >
                                        {isManualProcess && <FiCheckCircle className="text-white w-3.5 h-3.5" />}
                                    </div>
                                    <label
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                        onClick={() => setIsManualProcess(!isManualProcess)}
                                    >
                                        Proses Manual
                                    </label>
                                    <div className="group relative">
                                        <FiInfo className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                            Centang jika proses transaksi dilakukan secara manual
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Status Brand</label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Aktifkan atau nonaktifkan brand ini dari toko</p>
                                    </div>
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                </div>

                                {/* {profitMethod === 'MARGIN' && (
                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Konfigurasi Margin per Pricing Tier</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {isLoadingPricingTiers ? (
                                                <div className="text-sm text-gray-500">Memuat pricing tiers...</div>
                                            ) : pricingTiers.map(tier => {
                                                const currentMargin = margins.find(m => String(m.tierId) === String(tier.id))?.percentage || "";
                                                return (
                                                    <div key={tier.id} className="space-y-1.5">
                                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Margin {tier.name} (%)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={currentMargin}
                                                            onChange={(e) => {
                                                                const val = e.target.value ? Number(e.target.value) : 0;
                                                                setMargins(prev => {
                                                                    const exists = prev.find(m => String(m.tierId) === String(tier.id));
                                                                    if (exists) {
                                                                        return prev.map(m => String(m.tierId) === String(tier.id) ? { ...m, percentage: val } : m);
                                                                    }
                                                                    return [...prev, { tierId: String(tier.id), percentage: val }];
                                                                });
                                                            }}
                                                            placeholder="0"
                                                            className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )} */}
                            </div>

                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL (Opsional)</label>
                            <Input
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            {logo && (
                                <div className="mt-3 p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pratinjau:</p>
                                    <div className="flex items-center justify-center">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30"></div>
                                            <Image
                                                src={logo}
                                                alt="Logo preview"
                                                width={80}
                                                height={80}
                                                className="relative h-20 w-20 object-contain rounded-xl bg-white dark:bg-gray-900 p-2"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/BLANK_ICON.png';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="px-5 py-2.5 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-all duration-200"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <HiOutlineSparkles className="h-4 w-4" />
                                        {editId ? 'Simpan Perubahan' : 'Tambah Brand'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Brand Dialog */}
            <Dialog open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null); }}>
                <DialogContent className="sm:max-w-[520px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl">
                    <DialogHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20">
                                <FiEye className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Detail Brand
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    {detailBrand && (
                        <div className="space-y-5">
                            {/* Brand Header Card */}
                            <div className="relative overflow-hidden rounded-xl">
                                <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700"></div>
                                <div className="relative p-5 flex items-center gap-4">
                                    <div className="relative">
                                        {detailBrand.logo ? (
                                            <>
                                                <div className="absolute -inset-1 bg-white/30 rounded-xl blur"></div>
                                                <Image
                                                    src={detailBrand.logo}
                                                    alt={detailBrand.name}
                                                    width={72}
                                                    height={72}
                                                    className="relative h-18 w-18 object-contain rounded-xl bg-white p-2 shadow-lg"
                                                />
                                            </>
                                        ) : (
                                            <div className="h-18 w-18 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                                <FiPackage className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white">{detailBrand.name}</h3>
                                        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                                            <code className="text-xs font-mono text-white">{detailBrand.code}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Publisher</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{getPublisherName(detailBrand.publisher)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-linear-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl border border-sky-100 dark:border-sky-800/50">
                                    <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                        <FiLayers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Tipe</p>
                                        {detailBrand.types && detailBrand.types.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {detailBrand.types.map(t => (
                                                    <span key={t.id} className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-md bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-sky-200/50 dark:border-sky-700/50">
                                                        {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Belum ada tipe</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <FiTag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Kategori</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{resolveCategoryName(detailBrand.category as string | CategoryObject | undefined, (detailBrand as BrandWithCategoryId).categoryId, categories)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
