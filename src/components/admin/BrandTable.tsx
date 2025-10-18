"use client";

import React, { useEffect, useState } from "react";
import { fetchBrands, createBrand, updateBrand, deleteBrand, Brand, CategoryObject, PublisherObject } from "@/services/brand.client";

const getCategoryName = (category: string | CategoryObject): string => {
    return typeof category === 'object' && category !== null ? category.name : category;
};

const getPublisherName = (publisher: string | PublisherObject): string => {
    return typeof publisher === 'object' && publisher !== null ? publisher.name : publisher || '-';
};

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiTrash2, FiPlus, FiEye } from "react-icons/fi";
import Image from "next/image";

interface Category {
    id: number;
    name: string;
    color?: string;
}

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
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/v1/categories');
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                const fetchedCategories = (data || []).map((cat: Category) => ({
                    ...cat,
                    color: cat.color || getCategoryColor(cat.name)
                }));
                setCategories(fetchedCategories);
                setCategoriesError(null);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoriesError('Failed to load categories. Using default categories.');
                // Fallback to default categories if API fails
                setCategories([
                    { id: 1, name: 'Game', color: defaultCategoryColors['Game'] },
                    { id: 2, name: 'Pulsa', color: defaultCategoryColors['Pulsa'] },
                    { id: 3, name: 'PLN', color: defaultCategoryColors['PLN'] },
                    { id: 4, name: 'E-Money', color: defaultCategoryColors['E-Money'] },
                ]);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [publisher, setPublisher] = useState("");
    const [logo, setLogo] = useState("");
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detailId, setDetailId] = useState<number | null>(null);
    const rowsPerPage = 5;

    // Chart dummy: jumlah produk per brand
    // const chartData = brands.map(brand => ({
    //     name: brand.name,
    //     value: Math.floor(Math.random() * 10) + 1
    // }));

    const loadBrands = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchBrands();
            setBrands(data);
        } catch (err) {
            console.error('Error in loadBrands:', err);
            setError('Failed to load brands. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    // Filter & pagination
    const filteredBrands = brands.filter(brand =>
        search ? brand.name.toLowerCase().includes(search.toLowerCase()) : true
    );
    const paginatedBrands = filteredBrands.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const detailBrand = detailId ? brands.find(brand => brand.id === detailId) : null;
    console.log(paginatedBrands);

    if (isLoading && brands.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Memuat Data Brand</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mohon tunggu sebentar...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Terjadi Kesalahan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
                    </div>
                    <Button
                        onClick={loadBrands}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Coba Lagi
                    </Button>
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
        setType(brandItem.type || "");
        setOpen(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setName("");
        setBrand("");
        setCategory("");
        setPublisher("");
        setLogo("");
        setType("");
        setOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (editId) {
                // Update existing brand
                const updatedBrand = await updateBrand(editId, {
                    name,
                    code: brand,
                    categoryId: category || undefined,
                    publisher,
                    logo: logo || undefined,
                    type: type || undefined,
                });
                console.log(updatedBrand);
                setBrands(brands =>
                    brands.map(b => {
                        if (b.id === editId) {
                            // Find the category object from categories list to include in the updated brand
                            const categoryObj = categories.find(c => c.id.toString() === category);

                            return {
                                ...b,          // Keep all existing properties
                                ...updatedBrand, // Apply updates from API
                                // Override with form data to ensure category is correct
                                name,
                                code: brand,
                                publisher,
                                logo: logo || undefined,
                                type: type || undefined,
                                categoryId: category, // Use selected category ID from form
                                category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : category, // Use selected category object from form
                            };
                        }
                        return b;
                    })
                );
            } else {
                // Create new brand
                const brandCode = brand || name.toLowerCase().replace(/\s+/g, '-');
                const newBrand = await createBrand({
                    name,
                    code: brandCode,
                    categoryId: category, // category holds selected categoryId
                    publisher: publisher || "-",
                    logo: logo || undefined,
                    type: type || undefined,
                });

                // Find the category object from categories list to include in the new brand
                const categoryObj = categories.find(c => c.id.toString() === category);

                // Create the updated brand with proper types
                const updatedBrand: Brand = {
                    ...newBrand,
                    category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : category,
                    categoryId: category, // Ensure categoryId is always a string
                    type: type // Include type from form
                };

                setBrands(brands => [...brands, updatedBrand]);
            }
            setOpen(false);
        } catch (err) {
            console.error('Error saving brand:', err);
            setError(err instanceof Error ? err.message : 'Gagal menyimpan brand');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus brand ini?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await deleteBrand(id);

            // Remove the brand from the state
            const newBrands = brands.filter(b => b.id !== id);
            setBrands(newBrands);

            // If current page becomes empty, go back to the last valid page
            const maxPage = Math.ceil(newBrands.length / rowsPerPage) || 1;
            if (page > maxPage) {
                setPage(maxPage);
            }

        } catch (err) {
            console.error('Error deleting brand:', err);
            setError(err instanceof Error ? err.message : 'Gagal menghapus brand');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Kelola Brand
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Kelola dan pantau semua brand yang tersedia di sistem
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <FiPlus className="mr-2 h-5 w-5" />
                        Tambah Brand Baru
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <FiEye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                        <Input
                            placeholder="Cari brand berdasarkan nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredBrands.length}</span> brand</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">No</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Logo</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama Brand</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kode Brand</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Publisher</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tipe</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kategori</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">Aksi</TableHead>
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
                                    <TableRow key={brand.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">
                                            {index + 1 + (page - 1) * rowsPerPage}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center h-12 w-12">
                                                {brand?.logo ? (
                                                    <div className="relative">
                                                        <Image
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                                                        />
                                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10"></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">No Logo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{brand?.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Brand</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg font-mono text-gray-700 dark:text-gray-300">
                                                {brand?.code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{getPublisherName(brand?.publisher)}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Publisher</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                                {brand?.type || 'Tidak ada tipe'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="px-3 py-1.5 text-xs font-medium rounded-full border"
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
                                            <div className="flex justify-center">
                                                <div className="flex space-x-1">
                                                    <Button
                                                        title="Lihat Detail"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDetailId(brand.id)}
                                                        className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <FiEye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        title="Edit"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(brand)}
                                                        className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                    >
                                                        <FiEdit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        title="Hapus"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(brand.id)}
                                                        className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

                {/* Pagination Section */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {(() => {
                            const startItem = (page - 1) * rowsPerPage + 1;
                            const endItem = Math.min(page * rowsPerPage, filteredBrands.length);
                            const totalItems = filteredBrands.length;

                            if (totalItems === 0) {
                                return 'Tidak ada brand ditemukan';
                            }

                            return `Menampilkan ${startItem}-${endItem} dari ${totalItems} brand`;
                        })()}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * rowsPerPage >= filteredBrands.length}
                            className="px-4 py-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 border-0 shadow-2xl">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            {editId ? 'Edit Brand' : 'Tambah Brand Baru'}
                        </DialogTitle>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {editId ? 'Perbarui informasi brand yang sudah ada' : 'Buat brand baru dengan informasi lengkap'}
                        </p>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Brand</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Mobile Legends"
                                    className="border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kode Brand</label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="Contoh: ml"
                                    className="border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Publisher</label>
                                <Input
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                    placeholder="Contoh: Moonton"
                                    className="border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipe Brand</label>
                                <Input
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="Contoh: Game, Pulsa, E-Money"
                                    className="border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                                disabled={isLoadingCategories}
                            >
                                <option value="">Pilih Kategori</option>
                                {isLoadingCategories ? (
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
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Logo URL (Opsional)</label>
                            <Input
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            {logo && (
                                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Pratinjau Logo:</p>
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={logo}
                                            alt="Logo preview"
                                            width={80}
                                            height={80}
                                            className="h-20 w-20 object-contain border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/BLANK_ICON.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-600">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="px-6 py-2.5 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 rounded-lg font-medium transition-colors"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    editId ? 'Simpan Perubahan' : 'Tambah Brand'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Brand Dialog */}
            <Dialog open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null); }}>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-0 shadow-2xl">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Detail Brand
                        </DialogTitle>
                    </DialogHeader>
                    {detailBrand && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div className="relative">
                                    {detailBrand.logo ? (
                                        <Image
                                            src={detailBrand.logo}
                                            alt={detailBrand.name}
                                            width={64}
                                            height={64}
                                            className="h-16 w-16 object-contain rounded-lg border-2 border-white dark:border-gray-600 shadow-md"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-600 shadow-md">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">No Logo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailBrand.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Kode: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-700 dark:text-gray-300">{detailBrand.code}</code></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Publisher</div>
                                    <div className="text-lg font-medium text-blue-900 dark:text-blue-100">{getPublisherName(detailBrand.publisher)}</div>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Tipe</div>
                                    <div className="text-lg font-medium text-purple-900 dark:text-purple-100">{detailBrand.type || 'Tidak ada tipe'}</div>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Kategori</div>
                                    <div className="text-lg font-medium text-green-900 dark:text-green-100">{resolveCategoryName(detailBrand.category as string | CategoryObject | undefined, (detailBrand as BrandWithCategoryId).categoryId, categories)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
