"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiLoader } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/category.client";
import toast from 'react-hot-toast';

export default function CategoryTable() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const pageSize = 4;
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoading(true);
                const data = await fetchCategories();
                setCategories(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load categories:', err);
                setError('Gagal memuat kategori. Silakan coba lagi nanti.');
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Chart data using actual brand count from API
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
        setOpen(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setName("");
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            if (editId) {
                const updatedCategory = await updateCategory(editId, {
                    name,
                    brandCount: 0,
                    is_active: true
                } as Omit<Category, 'id'>);
                setCategories(cats =>
                    cats.map(c => c.id === editId ? updatedCategory : c)
                );
            } else {
                const newCategory = await createCategory({
                    name,
                    brandCount: 0,
                    is_active: true
                } as Omit<Category, 'id'>);
                setCategories(cats => [...cats, newCategory]);
            }
            setOpen(false);
        } catch (err) {
            console.error('Failed to save category:', err);
            setError(editId ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setCategoryToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setIsSubmitting(true);
            await deleteCategory(categoryToDelete);
            setCategories(cats => cats.filter(c => c.id !== categoryToDelete));
            toast.success('Kategori berhasil dihapus');
        } catch (err) {
            console.error('Failed to delete category:', err);
            toast.error('Gagal menghapus, kategori masih terhubung dengan brand');
        } finally {
            setIsSubmitting(false);
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    return (
        <div className="space-y-6">
            {/* Chart jumlah produk per kategori */}
            <Card>
                <CardHeader><CardTitle>Grafik Produk per Kategori</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            {/* <Tooltip formatter={(value) => [value, 'Brand']} labelFormatter={(label) => `Jumlah Brand: ${label}`} contentStyle={{ backgroundColor: '#' }} labelStyle={{ color: '#3b82f6' }} /> */}
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
                                <TableHead>Nama Kategori</TableHead>
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
                                        {error}
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
                                <div><strong>Nama:</strong> {detailCat.name}</div>
                                <div><strong>Jumlah Produk:</strong> {chartData.find(c => c.name === detailCat.name)?.value}</div>
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
                                <label className="block text-sm font-medium mb-1">Nama Kategori</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Nama kategori"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
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
                        <Button variant="outline" onClick={handleCancelDelete} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
