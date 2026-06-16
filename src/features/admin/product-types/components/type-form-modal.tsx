"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiLoader, FiPlus, FiEdit2 } from "react-icons/fi";
import { useCreateType, useUpdateType } from "@/hooks/useTypes";
import { fetchBrands } from "@/services/brand.client";
import { useQuery } from "@tanstack/react-query";
import { TypeItem } from "../types";
import toast from "react-hot-toast";

interface TypeFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: TypeItem | null;
}

export default function TypeFormModal({ open, onOpenChange, initialData }: TypeFormModalProps) {
    const [name, setName] = useState("");
    const [prefix, setPrefix] = useState("");
    const [brandId, setBrandId] = useState("");

    const createMutation = useCreateType();
    const updateMutation = useUpdateType();

    const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
        queryKey: ['brands-list'],
        queryFn: fetchBrands,
        enabled: open,
    });

    useEffect(() => {
        if (open && initialData) {
            setName(initialData.name);
            setPrefix(initialData.prefix);
            setBrandId(initialData.brandId);
        } else if (open && !initialData) {
            setName("");
            setPrefix("");
            setBrandId("");
        }
    }, [open, initialData]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleSave = () => {
        if (!name.trim() || !prefix.trim() || !brandId) {
            toast.error('Harap lengkapi semua field');
            return;
        }
        const payload = { name, prefix, brandId };

        if (initialData) {
            updateMutation.mutate({ id: initialData.id, data: payload }, {
                onSuccess: () => { toast.success('Tipe berhasil diperbarui'); onOpenChange(false); },
                onError: (err) => { toast.error(err.message || 'Gagal memperbarui tipe'); }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => { toast.success('Tipe berhasil ditambahkan'); onOpenChange(false); },
                onError: (err) => { toast.error(err.message || 'Gagal menambahkan tipe'); }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl font-black">
                        <div className={`p-2 rounded-lg ${initialData ? 'bg-blue-500/15 text-blue-500' : 'bg-indigo-500/15 text-indigo-500'}`}>
                            {initialData ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                        </div>
                        {initialData ? 'Edit' : 'Tambah'} Tipe
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Nama Tipe</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Contoh: Umum, Membership"
                            disabled={isSubmitting}
                            className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">SKU Code (Prefix)</label>
                        <Input
                            value={prefix}
                            onChange={e => setPrefix(e.target.value)}
                            placeholder="Contoh: mlbb_dm"
                            disabled={isSubmitting}
                            className="h-12 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-1">Brand</label>
                        <div className="relative">
                            <select
                                value={brandId}
                                onChange={e => setBrandId(e.target.value)}
                                disabled={isSubmitting || isLoadingBrands}
                                className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all text-sm text-gray-900 dark:text-white appearance-none"
                                required
                            >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pilih Brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="flex-1 h-11 rounded-xl border-gray-200 dark:border-white/10 font-bold"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex-1 h-11 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <FiLoader className="animate-spin mr-2" />
                                Menyimpan...
                            </>
                        ) : 'Simpan Tipe'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
