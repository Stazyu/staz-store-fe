"use client";

import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiLoader } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.client";
import { Category, CreateCategoryDto } from "@/types/category";


export default function CategoryTable() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState<null | string>(null);
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
        setFormError(null);
        setOpen(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setName("");
        setDisplayName("");
        setFormError(null);
        setOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim() && !displayName?.trim()) return;

        const payload = {
            name,
            displayName: displayName?.trim() || undefined,
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

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Chart jumlah produk per kategori */}
            <Card>
                <CardHeader><CardTitle>Grafik Produk per Kategori</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#000' }} labelStyle={{ color: '#3b82f6' }} />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Kategori Produk</CardTitle>
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kategori..." className="w-48" />
                        <Button size="sm" onClick={handleAdd} className="gap-2"><FiPlus />Tambah</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Name</TableHead>
                                {/* <TableHead>Display Name</TableHead> */}
                                <TableHead className="text-center">Total Brand</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <FiLoader className="animate-spin text-2xl text-gray-500" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-red-500 py-4">
                                        {(error as Error).message || 'Terjadi kesalahan saat memuat data'}
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                                        Tidak ada data kategori
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((cat, idx) => (
                                    <TableRow key={cat.id}>
                                        <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                                        <TableCell>{cat.name}</TableCell>
                                        {/* <TableCell>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-mono border border-gray-200 dark:border-gray-700">
                                                {cat.displayName}
                                            </code>
                                        </TableCell> */}
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white">
                                                {cat.brandCount || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}><FiEdit2 /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(cat.id)}><FiTrash2 /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setDetailId(cat.id)}><FiEye /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {/* Pagination */}
                <div className="flex justify-between items-center px-4 pb-4">
                    <span className="text-xs text-gray-500">Menampilkan {paginated.length ? ((page - 1) * pageSize + 1) : 0} - {(page - 1) * pageSize + paginated.length} dari {filtered.length} kategori</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                        <span className="text-xs px-2">Halaman {page} / {totalPage || 1}</span>
                        <Button variant="outline" size="sm" disabled={page === totalPage || totalPage === 0} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
                    </div>
                </div>
                {/* Modal detail kategori */}
                <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Kategori</DialogTitle>
                        </DialogHeader>
                        {detailCat && (
                            <div className="space-y-2">
                                <div><strong>Name:</strong> {detailCat.name}</div>
                                <div><strong>Display Name:</strong> {detailCat.displayName || '-'}</div>
                                <div><strong>Total Brand:</strong> {chartData.find(c => c.name === detailCat.name)?.value}</div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                {/* Modal tambah/edit kategori */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editId ? 'Edit' : 'Tambah'} Kategori</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Name"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Display Name (Optional)</label>
                                <Input
                                    value={displayName || ''}
                                    onChange={e => setDisplayName(e.target.value === '' ? null : e.target.value)}
                                    placeholder="Display Name"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {formError && (
                                <div className="text-red-500 text-sm">{formError}</div>
                            )}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!name.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin mr-2" />
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

            </Card>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Kategori</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Apakah Anda yakin ingin menghapus kategori ini?</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tindakan ini tidak dapat dibatalkan dan akan menghapus kategori secara permanen.
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
