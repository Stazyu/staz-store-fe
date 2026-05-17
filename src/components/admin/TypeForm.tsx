"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiLoader } from "react-icons/fi";
import { useCreateType, useUpdateType } from "@/hooks/useTypes";
import { fetchBrands } from "@/services/brand.client";
import { useQuery } from "@tanstack/react-query";
import { TypeItem } from "@/types/type.types";
import toast from "react-hot-toast";

interface TypeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: TypeItem | null;
}

export default function TypeForm({ open, onOpenChange, initialData }: TypeFormProps) {
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Tipe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Tipe</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Umum, Membership" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU Code (Prefix)</label>
                        <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Contoh: mlbb_dm" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                        <select
                            value={brandId}
                            onChange={e => setBrandId(e.target.value)}
                            disabled={isSubmitting || isLoadingBrands}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Pilih Brand</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <><FiLoader className="animate-spin mr-1.5" /> Menyimpan...</> : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
