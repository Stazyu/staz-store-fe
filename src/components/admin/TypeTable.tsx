"use client";

import React, { useState, useMemo } from "react";
import { useTypes, useDeleteType } from "@/hooks/use-types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    FiEdit2, FiTrash2, FiPlus, FiLoader, FiRefreshCw,
    FiSearch, FiLayers, FiChevronUp, FiChevronDown, FiEye
} from "react-icons/fi";
import { TypeItem } from "@/types/type.types";
import toast from "react-hot-toast";
import TypeForm from "./TypeForm";
import { useQueryClient } from "@tanstack/react-query";

type SortField = 'name' | 'prefix' | 'brand' | 'products';
type SortDirection = 'asc' | 'desc';

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
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tipe Produk</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{types.length} tipe terdaftar</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['types'] })}
                        disabled={isFetching}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <Button size="sm" onClick={handleAdd} className="gap-1.5 h-9 rounded-lg">
                        <FiPlus className="w-4 h-4" /> Tambah Tipe
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Cari tipe..."
                            className="pl-9 h-9 text-sm rounded-lg"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-100 dark:border-gray-800">
                                <TableHead className="w-14 text-center text-xs">No</TableHead>
                                <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('name')}>Nama {renderSortIcon('name')}</TableHead>
                                <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('prefix')}>Prefix {renderSortIcon('prefix')}</TableHead>
                                <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('brand')}>Brand {renderSortIcon('brand')}</TableHead>
                                <TableHead className="text-xs">Kategori</TableHead>
                                <TableHead className="text-xs text-center cursor-pointer select-none" onClick={() => handleSort('products')}>Produk {renderSortIcon('products')}</TableHead>
                                <TableHead className="text-xs text-right pr-4">Aksi</TableHead>
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
                                <TableRow><TableCell colSpan={7} className="h-48 text-center text-gray-400 text-sm">
                                    Tidak ada data tipe
                                </TableCell></TableRow>
                            ) : paginated.map((item, idx) => (
                                <TableRow key={item.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <TableCell className="text-center text-sm text-gray-400">{(page - 1) * pageSize + idx + 1}</TableCell>
                                    <TableCell className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</TableCell>
                                    <TableCell>
                                        <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">{item.prefix}</code>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">{item.brand?.name || '—'}</TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">{item.brand?.category?.name || '—'}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item._count?.products || 0}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-0.5 pr-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(item.id)}><FiEye className="w-3.5 h-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}><FiEdit2 className="w-3.5 h-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(item.id)}><FiTrash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPage > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {paginated.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + paginated.length} dari {sortedTypes.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 text-xs rounded-lg">Sebelumnya</Button>
                            <span className="text-xs text-gray-500 px-2">{page}/{totalPage}</span>
                            <Button variant="outline" size="sm" disabled={page >= totalPage} onClick={() => setPage(p => p + 1)} className="h-8 text-xs rounded-lg">Berikutnya</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Detail Tipe</DialogTitle>
                    </DialogHeader>
                    {detailType && (
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Nama</span><p className="font-medium text-gray-900 dark:text-white">{detailType.name}</p></div>
                            <div><span className="text-gray-500">Prefix</span><p className="font-mono text-gray-900 dark:text-white">{detailType.prefix}</p></div>
                            <div><span className="text-gray-500">Brand</span><p className="text-gray-900 dark:text-white">{detailType.brand?.name || '—'}</p></div>
                            <div><span className="text-gray-500">Kategori</span><p className="text-gray-900 dark:text-white">{detailType.brand?.category?.name || '—'}</p></div>
                            <div><span className="text-gray-500">Total Produk</span><p className="font-medium text-gray-900 dark:text-white">{detailType._count?.products || 0}</p></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailId(null)} className="w-full">Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TypeForm open={formOpen} onOpenChange={setFormOpen} initialData={editData} />

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Hapus Tipe</DialogTitle></DialogHeader>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.</p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setTypeToDelete(null); }} disabled={deleteMutation.isPending}>Batal</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
