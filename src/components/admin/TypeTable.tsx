"use client";

import React, { useState } from "react";
import { useTypes, useDeleteType } from "@/hooks/use-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiLoader } from "react-icons/fi";
import { TypeItem } from "@/types/type.types";
import toast from "react-hot-toast";
import TypeForm from "./TypeForm";

export default function TypeTable() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<TypeItem | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

    const { data: types = [], isLoading, error } = useTypes({ search });
    const deleteMutation = useDeleteType();

    // Filter and pagination
    // (Assuming the API returns all matching the search and we paginate in the frontend like the existing code)
    const totalPage = Math.ceil(types.length / pageSize);
    const paginated = types.slice((page - 1) * pageSize, page * pageSize);

    const handleAdd = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const handleEdit = (typeItem: TypeItem) => {
        setEditData(typeItem);
        setFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setTypeToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (typeToDelete) {
            deleteMutation.mutate(typeToDelete, {
                onSuccess: () => {
                    toast.success('Type berhasil dihapus');
                    setDeleteModalOpen(false);
                    setTypeToDelete(null);
                },
                onError: (error) => {
                    toast.error(error.message || 'Gagal menghapus type');
                }
            });
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setTypeToDelete(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Daftar Tipe</CardTitle>
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                        <Input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Cari tipe..."
                            className="w-48"
                        />
                        <Button size="sm" onClick={handleAdd} className="gap-2">
                            <FiPlus />Tambah Tipe
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Nama Tipe</TableHead>
                                    <TableHead>Prefix</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-center">Total Produk</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex justify-center">
                                                <FiLoader className="animate-spin text-2xl text-gray-500" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-red-500 py-4">
                                            {(error as Error).message || 'Terjadi kesalahan saat memuat data'}
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                                            Tidak ada data tipe
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-mono border border-gray-200 dark:border-gray-700">
                                                    {item.prefix}
                                                </code>
                                            </TableCell>
                                            <TableCell>{item.brand?.name || '-'}</TableCell>
                                            <TableCell>{item.brand?.category?.name || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {item._count?.products || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 justify-center">
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                                        <FiEdit2 />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(item.id)}>
                                                        <FiTrash2 className="text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {/* Pagination */}
                <div className="flex justify-between items-center px-4 pb-4">
                    <span className="text-xs text-gray-500">
                        Menampilkan {paginated.length ? ((page - 1) * pageSize + 1) : 0} - {(page - 1) * pageSize + paginated.length} dari {types.length} type
                    </span>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-xs px-2">Halaman {page} / {totalPage || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPage || totalPage === 0}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </Card>

            <TypeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                initialData={editData}
            />

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Tipe</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Apakah Anda yakin ingin menghapus tipe ini?</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tindakan ini tidak dapat dibatalkan dan akan menghapus tipe secara permanen.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelDelete} disabled={deleteMutation.isPending}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
