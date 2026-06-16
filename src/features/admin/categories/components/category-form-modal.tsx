"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiPlus, FiLoader, FiActivity } from "react-icons/fi";
import { createCategory, updateCategory } from "@/services/category.client";
import { Category, CreateCategoryDto } from "../types";

interface CategoryFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess?: () => void;
}

export default function CategoryFormModal({ open, onOpenChange, category, onSuccess }: CategoryFormModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (category) {
                setName(category.name);
                setDisplayName(category.displayName || "");
                setSortOrder(category.sortOrder ?? null);
            } else {
                setName("");
                setDisplayName("");
                setSortOrder(null);
            }
            setFormError(null);
        }
    }, [open, category]);

    const createMutation = useMutation({
        mutationFn: (data: CreateCategoryDto) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-list'] });
            toast.success('Kategori berhasil ditambahkan');
            onOpenChange(false);
            if (onSuccess) onSuccess();
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
            toast.success('Kategori berhasil diperbarui');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        },
        onError: (err) => {
            console.error('Failed to update category:', err);
            setFormError('Gagal memperbarui kategori');
            toast.error('Gagal memperbarui kategori');
        }
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleSave = async () => {
        if (!name.trim()) return;

        const payload = {
            name,
            displayName: displayName.trim() || undefined,
            sortOrder: sortOrder,
        };

        if (category?.id) {
            updateMutation.mutate({ id: category.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl font-black">
                        <div className={`p-2 rounded-lg ${category ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                            {category ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                        </div>
                        {category ? 'Edit' : 'Tambah'} Kategori
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
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
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
                        onClick={() => onOpenChange(false)}
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
    );
}
