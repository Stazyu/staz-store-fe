"use client";

import React, { useState, useMemo } from "react";
import { useTypes, useDeleteType } from "@/hooks/useTypes";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    FiEdit2, FiTrash2, FiPlus, FiLoader, FiRefreshCw,
    FiSearch, FiLayers, FiChevronUp, FiChevronDown, FiEye,
    FiBox, FiPackage, FiTrendingUp
} from "react-icons/fi";
import { TypeItem } from "../types";
import toast from "react-hot-toast";
import TypeFormModal from "./type-form-modal";
import { typeColumns } from "./type-columns";
import { useQueryClient } from "@tanstack/react-query";

type SortField = 'name' | 'prefix' | 'brand' | 'products';
type SortDirection = 'asc' | 'desc';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
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

export default function TypeTable() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<TypeItem | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ field: 'name', direction: 'asc' });

    const { data: types = [], isLoading, error, isFetching } = useTypes({ search });
    const deleteMutation = useDeleteType();

    const stats = useMemo(() => {
        const totalProducts = types.reduce((acc, t) => acc + (t._count?.products || 0), 0);
        const uniqueBrands = new Set(types.map(t => t.brand?.name).filter(Boolean)).size;
        const topType = [...types].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))[0]?.name || "-";
        return { totalProducts, uniqueBrands, topType };
    }, [types]);

    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({ field, direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const renderSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.direction === 'asc' ? <FiChevronUp className="inline ml-0.5 w-3.5 h-3.5" /> : <FiChevronDown className="inline ml-0.5 w-3.5 h-3.5" />;
    };

    const sortedTypes = useMemo(() => {
        const sorted = [...types];
        sorted.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (sortConfig.field) {
                case 'name': aVal = a.name; bVal = b.name; break;
                case 'prefix': aVal = a.prefix; bVal = b.prefix; break;
                case 'brand': aVal = a.brand?.name || ''; bVal = b.brand?.name || ''; break;
                case 'products': aVal = a._count?.products || 0; bVal = b._count?.products || 0; break;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [types, sortConfig]);

    const totalPage = Math.ceil(sortedTypes.length / pageSize);
    const paginated = sortedTypes.slice((page - 1) * pageSize, page * pageSize);
    const detailType = types.find(t => t.id === detailId);

    const handleAdd = () => { setEditData(null); setFormOpen(true); };
    const handleEdit = (item: TypeItem) => { setEditData(item); setFormOpen(true); };
    const handleDeleteClick = (id: string) => { setTypeToDelete(id); setDeleteModalOpen(true); };

    const handleConfirmDelete = () => {
        if (typeToDelete) {
            deleteMutation.mutate(typeToDelete, {
                onSuccess: () => { toast.success('Tipe berhasil dihapus'); setDeleteModalOpen(false); setTypeToDelete(null); },
                onError: (err) => { toast.error(err.message || 'Gagal menghapus tipe'); }
            });
        }
    };

    return (
        <div className="space-y-8 pb-8">

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 dark:border-sky-500/10 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#032630_45%,#02202b_100%)] shadow-[0_20px_80px_rgba(14,165,233,0.08)] p-8">
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
                            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Tipe Global</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            Manajemen
                            <span className="bg-linear-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent ml-3">
                                Tipe Produk
                            </span>
                        </h1>
                        <p className="text-slate-600 dark:text-sky-200/70 mt-3 text-base max-w-md">
                            Kelola tipe produk, prefix provider, serta hubungkan brand dan kategori secara terorganisir.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['types'] })}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium border border-slate-200 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Segarkan
                        </button>
                        <Button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white text-sm font-medium shadow-lg shadow-sky-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 h-auto"
                        >
                            <FiPlus className="w-4 h-4" />
                            Tambah Tipe
                        </Button>
                    </div>
                </div>

                <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
                    <MiniStat icon={FiBox} label="Total Tipe" value={types.length} color="text-sky-400" />
                    <MiniStat icon={FiPackage} label="Total Produk" value={stats.totalProducts} color="text-blue-400" />
                    <MiniStat icon={FiLayers} label="Brand Terhubung" value={stats.uniqueBrands} color="text-cyan-400" />
                    <MiniStat icon={FiTrendingUp} label="Top Tipe" value={stats.topType} color="text-indigo-400" />
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">

                {/* Search */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                            <FiLayers className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Daftar Tipe</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total {sortedTypes.length} tipe ditemukan</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Cari tipe..."
                            className="pl-10 w-full md:w-64 h-10 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                                {typeColumns.map(col => (
                                    <TableHead 
                                        key={col.key} 
                                        className={col.className}
                                        onClick={col.sortable ? () => handleSort(col.key as SortField) : undefined}
                                    >
                                        {col.header} {col.sortable && renderSortIcon(col.key as SortField)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="h-48 text-center">
                                    <FiLoader className="animate-spin text-xl text-gray-400 mx-auto" />
                                </TableCell></TableRow>
                            ) : error ? (
                                <TableRow><TableCell colSpan={7} className="h-48 text-center text-red-500 text-sm">
                                    {(error as Error).message || 'Gagal memuat data'}
                                </TableCell></TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-3 py-6">
                                        <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                                            <FiPackage className="text-3xl text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Tidak ada tipe ditemukan</p>
                                    </div>
                                </TableCell></TableRow>
                            ) : paginated.map((item, idx) => (
                                <TableRow key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors">
                                    <TableCell className="text-center text-xs font-medium text-gray-400">{(page - 1) * pageSize + idx + 1}</TableCell>
                                    <TableCell className="py-1">
                                        <p className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors whitespace-nowrap tracking-tight">{item.name}</p>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md font-mono font-medium text-blue-500">
                                            {item.prefix}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.brand?.name || '—'}</TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">{item.brand?.category?.name || '—'}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item._count?.products || 0}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1 pr-4">
                                            <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-all" onClick={() => setDetailId(item.id)}><FiEye className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all" onClick={() => handleEdit(item)}><FiEdit2 className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all" onClick={() => handleDeleteClick(item.id)}><FiTrash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPage > 0 && (
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="text-gray-900 dark:text-white">{(page - 1) * pageSize + 1}</span> - <span className="text-gray-900 dark:text-white">{(page - 1) * pageSize + paginated.length}</span> dari <span className="text-gray-900 dark:text-white">{sortedTypes.length}</span> tipe
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
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                                <FiEye className="w-5 h-5" />
                            </div>
                            Detail Tipe
                        </DialogTitle>
                    </DialogHeader>
                    {detailType && (
                        <div className="space-y-6 py-4 text-sm">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <FiLayers className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Nama Tipe</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{detailType.name}</p>
                                    <p className="text-xs font-mono text-blue-500">{detailType.prefix}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">Brand</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{detailType.brand?.name || '—'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Kategori</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{detailType.brand?.category?.name || '—'}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Total Produk</p>
                                <p className="text-2xl font-black text-emerald-500">{detailType._count?.products || 0}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailId(null)} className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TypeFormModal open={formOpen} onOpenChange={setFormOpen} initialData={editData} />

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
                                <FiTrash2 className="w-5 h-5" />
                            </div>
                            Hapus Tipe
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                            <p className="text-gray-900 dark:text-white font-bold">Apakah Anda yakin ingin menghapus tipe ini?</p>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Tindakan ini <span className="text-red-500 font-bold">permanen</span> dan data produk yang terhubung mungkin akan terpengaruh.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setTypeToDelete(null); }} disabled={deleteMutation.isPending} className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold">Batal</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending} className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 transition-all">
                            {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
