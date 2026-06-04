"use client";

import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
    FiEdit2, FiTrash2, FiPlus, FiEye, FiLoader, 
    FiGrid, FiLayers, FiBox, FiTrendingUp, FiRefreshCw, 
    FiSearch, FiActivity, FiArrowUpRight, FiZap
} from "react-icons/fi";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, TooltipProps 
} from "recharts";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.client";
import { Category, CreateCategoryDto } from "@/types/category.types";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold text-white">
                        {payload[0].value} Brand
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-white font-bold text-base leading-none">{value}</div>
                <div className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{label}</div>
            </div>
        </div>
    );
}


export default function CategoryTable() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState<null | string>(null);
    const [sortOrder, setSortOrder] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    // Additional state for form errors if needed, though toast is used mostly
    const [formError, setFormError] = useState<string | null>(null);

    const pageSize = 4;

    // Fetch Categories
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['categories-list'],
        queryFn: fetchCategories,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: CreateCategoryDto) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-list'] });
            setOpen(false);
            toast.success('Kategori berhasil ditambahkan');
            setName("");
        },
        onError: (err) => {
            console.error('Failed to create category:', err);
            setFormError('Gagal menambahkan kategori');
            toast.error('Gagal menambahkan kategori');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CreateCategoryDto> }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-list'] });
            setOpen(false);
            toast.success('Kategori berhasil diperbarui');
            setName("");
            setEditId(null);
        },
        onError: (err) => {
            console.error('Failed to update category:', err);
            setFormError('Gagal memperbarui kategori');
            toast.error('Gagal memperbarui kategori');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-list'] });
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            toast.success('Kategori berhasil dihapus');
        },
        onError: (err) => {
            console.error('Failed to delete category:', err);
            toast.error('Gagal menghapus, kategori mungkin masih terhubung dengan brand');
        }
    });

    // Chart data
    const chartData = categories.map(cat => ({
        name: cat.name,
        value: cat.brandCount || 0
    }));

    // Filter & pagination
    const filtered = categories.filter(cat =>
        search ? cat.name.toLowerCase().includes(search.toLowerCase()) : true
    );
    const totalPage = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const detailCat = categories.find(cat => cat.id === detailId);

    const handleEdit = (cat: Category) => {
        setEditId(cat.id);
        setName(cat.name);
        setDisplayName(cat.displayName || "");
        setSortOrder(cat.sortOrder ?? null);
        setFormError(null);
        setOpen(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setName("");
        setDisplayName("");
        setSortOrder(null);
        setFormError(null);
        setOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim() && !displayName?.trim()) return;

        const payload = {
            name,
            displayName: displayName?.trim() || undefined,
            sortOrder: sortOrder,
        };

        if (editId) {
            updateMutation.mutate({ id: editId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDeleteClick = (id: string) => {
        setCategoryToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const totalBrands = categories.reduce((acc, cat) => acc + (cat.brandCount || 0), 0);
    const avgBrands = categories.length > 0 ? (totalBrands / categories.length).toFixed(1) : 0;
    const topCategory = [...categories].sort((a, b) => (b.brandCount || 0) - (a.brandCount || 0))[0];

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-8 pb-8">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl p-8">
                <div className="absolute inset-0 bg-linear-to-br from-teal-950 via-emerald-950 to-cyan-950" />
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
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                            Kategori
                            <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent ml-3">
                                Produk
                            </span>
                        </h1>
                        <p className="text-emerald-200/70 mt-3 text-base max-w-md">
                            Kelola kategori produk dan distribusi brand Anda secara efisien.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['categories-list'] })}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group"
                        >
                            <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Refresh
                        </button>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <FiPlus className="w-4 h-4" />
                            Tambah Kategori
                        </button>
                    </div>
                </div>

                <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                    <MiniStat icon={FiLayers} label="Total Kategori" value={categories.length} color="text-emerald-400" />
                    <MiniStat icon={FiBox} label="Total Brand" value={totalBrands} color="text-cyan-400" />
                    <MiniStat icon={FiActivity} label="Rata-rata Brand" value={avgBrands} color="text-amber-400" />
                    <MiniStat icon={FiTrendingUp} label="Kategori Terpadat" value={topCategory?.name || "-"} color="text-rose-400" />
                </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Stats / Chart Card */}
                <div className="xl:col-span-1 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
                                <FiActivity className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Distribusi Brand</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jumlah brand per kategori</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex-1" style={{ minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0} initialDimension={{ width: 100, height: 100 }}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" stroke="#88888810" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    stroke="#888888" 
                                    fontSize={11} 
                                    axisLine={false} 
                                    tickLine={false}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar 
                                    dataKey="value" 
                                    fill="url(#barGrad)" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Card */}
                <div className="xl:col-span-2 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-500">
                                <FiGrid className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Daftar Kategori</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total {filtered.length} kategori ditemukan</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Cari kategori..." 
                                className="pl-10 w-full md:w-64 h-10 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                                    <TableHead className="w-16 text-center font-bold text-xs uppercase tracking-wider">No</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider">Nama Kategori</TableHead>
                                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider">Urutan</TableHead>
                                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider">Total Brand</TableHead>
                                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-8">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <FiLoader className="animate-spin text-3xl text-emerald-500" />
                                                <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                                                    <FiGrid className="text-3xl text-gray-300" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">Tidak ada kategori ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map((cat, idx) => (
                                        <TableRow key={cat.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors">
                                            <TableCell className="text-center text-sm font-medium text-gray-400">
                                                {(page - 1) * pageSize + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{cat.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{cat.displayName || '-'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {cat.sortOrder != null ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        #{cat.sortOrder}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    {cat.brandCount || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1 pr-4">
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => handleEdit(cat)}
                                                        className="w-9 h-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => setDetailId(cat.id)}
                                                        className="w-9 h-9 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-500 transition-all"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => handleDeleteClick(cat.id)}
                                                        className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-gray-900 dark:text-white">{(page - 1) * pageSize + 1}</span> - <span className="text-gray-900 dark:text-white">{(page - 1) * pageSize + paginated.length}</span> dari <span className="text-gray-900 dark:text-white">{filtered.length}</span> kategori
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
                                <span className="text-xs font-bold text-emerald-500">{page}</span>
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
                {/* Modal detail kategori */}
                <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                    <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-500">
                                    <FiEye className="w-5 h-5" />
                                </div>
                                Detail Kategori
                            </DialogTitle>
                        </DialogHeader>
                        {detailCat && (
                            <div className="space-y-6 py-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Nama Kategori</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{detailCat.name}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Display Name</p>
                                    <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{detailCat.displayName || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60 font-bold mb-1">Total Brand</p>
                                        <p className="text-2xl font-black text-emerald-500">{detailCat.brandCount || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center">
                                        <FiBox className="w-8 h-8 text-cyan-500 opacity-20" />
                                    </div>
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

                {/* Modal tambah/edit kategori */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <div className={`p-2 rounded-lg ${editId ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                                    {editId ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                                </div>
                                {editId ? 'Edit' : 'Tambah'} Kategori
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Nama Kategori</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Masukkan nama kategori (e.g. Games)"
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Display Name (Optional)</label>
                                <Input
                                    value={displayName || ''}
                                    onChange={e => setDisplayName(e.target.value === '' ? null : e.target.value)}
                                    placeholder="Masukkan nama tampilan"
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    disabled={isSubmitting}
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
                                    className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    disabled={isSubmitting}
                                />
                                <p className="text-[10px] text-gray-400 ml-1">Angka kecil tampil lebih atas di Telegram Bot. Kosongkan jika tidak perlu prioritas.</p>
                            </div>
                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-shake">
                                    <FiActivity className="w-4 h-4" />
                                    {formError}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!name.trim() || isSubmitting}
                                className="flex-1 h-11 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : 'Simpan Kategori'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
                                    <FiTrash2 className="w-5 h-5" />
                                </div>
                                Hapus Kategori
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                                <p className="text-gray-900 dark:text-white font-bold">Apakah Anda yakin ingin menghapus kategori ini?</p>
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                    Tindakan ini <span className="text-red-500 font-bold">permanen</span> dan kategori yang terhubung dengan brand mungkin akan mengalami kendala.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={handleCancelDelete} disabled={deleteMutation.isPending} className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold">
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 transition-all"
                            >
                                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>
    );
}
