"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethod } from "@/services/paymentMethod.admin.client";
import { toast } from "react-hot-toast";

interface PaymentMethodFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethod: PaymentMethod | null; // null for create
    onSave: (data: Partial<PaymentMethod>) => Promise<void>;
}

export default function PaymentMethodFormDialog({
    open,
    onOpenChange,
    paymentMethod,
    onSave,
}: PaymentMethodFormDialogProps) {
    const isEdit = !!paymentMethod;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        provider: "INTERNAL",
        category: "other",
        feeType: "NONE" as "NONE" | "FLAT" | "PERCENT" | "FLAT_PERCENT",
        feeFlat: 0,
        feePercent: 0, // basis points
        feeMin: "" as string | number,
        feeMax: "" as string | number,
        feeChargedTo: "CUSTOMER" as "CUSTOMER" | "MERCHANT",
        sortOrder: 0,
        iconUrl: "",
        isActive: true,
    });

    useEffect(() => {
        if (paymentMethod) {
            setFormData({
                code: paymentMethod.code,
                name: paymentMethod.name,
                provider: paymentMethod.provider || "INTERNAL",
                category: paymentMethod.category || "other",
                feeType: paymentMethod.feeType || "NONE",
                feeFlat: paymentMethod.feeFlat || 0,
                feePercent: paymentMethod.feePercent || 0,
                feeMin: paymentMethod.feeMin !== null ? paymentMethod.feeMin : "",
                feeMax: paymentMethod.feeMax !== null ? paymentMethod.feeMax : "",
                feeChargedTo: paymentMethod.feeChargedTo || "CUSTOMER",
                sortOrder: paymentMethod.sortOrder || 0,
                iconUrl: paymentMethod.iconUrl || "",
                isActive: paymentMethod.isActive,
            });
        } else {
            setFormData({
                code: "",
                name: "",
                provider: "INTERNAL",
                category: "other",
                feeType: "NONE",
                feeFlat: 0,
                feePercent: 0,
                feeMin: "",
                feeMax: "",
                feeChargedTo: "CUSTOMER",
                sortOrder: 0,
                iconUrl: "",
                isActive: true,
            });
        }
    }, [paymentMethod, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                ...formData,
                feeFlat: Number(formData.feeFlat),
                feePercent: Number(formData.feePercent),
                feeMin: formData.feeMin === "" ? null : Number(formData.feeMin),
                feeMax: formData.feeMax === "" ? null : Number(formData.feeMax),
                sortOrder: Number(formData.sortOrder),
            };

            await onSave(payload);
            toast.success(isEdit ? "Metode pembayaran diperbarui" : "Metode pembayaran dibuat");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-slate-400">Kode Unik</Label>
                            <Input
                                id="code"
                                placeholder="E.g., VA_BCA"
                                value={formData.code}
                                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                                disabled={isEdit}
                                required
                                className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-400">Nama Tampilan</Label>
                            <Input
                                id="name"
                                placeholder="E.g., Bank BCA"
                                value={formData.name}
                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                required
                                className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Provider & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400">Provider Payment</Label>
                            <Select
                                value={formData.provider}
                                onValueChange={(value) => setFormData((p) => ({ ...p, provider: value }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Pilih Provider" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="INTERNAL">INTERNAL</SelectItem>
                                    <SelectItem value="MIDTRANS">MIDTRANS</SelectItem>
                                    <SelectItem value="XENDIT">XENDIT</SelectItem>
                                    <SelectItem value="TRIPAY">TRIPAY</SelectItem>
                                    <SelectItem value="DUITKU">DUITKU</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Kategori</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData((p) => ({ ...p, category: value }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="balance">Saldo (Balance)</SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                    <SelectItem value="e-wallet">E-Wallet</SelectItem>
                                    <SelectItem value="bank-transfer">Virtual Account / Transfer</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Fee Type & Charged To */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400">Tipe Biaya Admin</Label>
                            <Select
                                value={formData.feeType}
                                onValueChange={(value: any) => setFormData((p) => ({ ...p, feeType: value }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Pilih Tipe Biaya" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="NONE">Tanpa Biaya (NONE)</SelectItem>
                                    <SelectItem value="FLAT">Nominal Tetap (FLAT)</SelectItem>
                                    <SelectItem value="PERCENT">Persentase (PERCENT)</SelectItem>
                                    <SelectItem value="FLAT_PERCENT">Tetap + Persentase</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Bebankan Ke</Label>
                            <Select
                                value={formData.feeChargedTo}
                                onValueChange={(value: any) => setFormData((p) => ({ ...p, feeChargedTo: value }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Pilih Target Beban" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="CUSTOMER">Customer (Pembeli)</SelectItem>
                                    <SelectItem value="MERCHANT">Merchant (Toko)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Fee Parameters based on Fee Type */}
                    {(formData.feeType === "FLAT" || formData.feeType === "FLAT_PERCENT") && (
                        <div className="space-y-2">
                            <Label htmlFor="feeFlat" className="text-slate-400">Biaya Flat (Rp)</Label>
                            <Input
                                id="feeFlat"
                                type="number"
                                min="0"
                                value={formData.feeFlat}
                                onChange={(e) => setFormData((p) => ({ ...p, feeFlat: Number(e.target.value) }))}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    )}

                    {(formData.feeType === "PERCENT" || formData.feeType === "FLAT_PERCENT") && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="feePercent" className="text-slate-400">Persen (Bps)</Label>
                                <Input
                                    id="feePercent"
                                    type="number"
                                    min="0"
                                    placeholder="70 = 0.7%"
                                    value={formData.feePercent}
                                    onChange={(e) => setFormData((p) => ({ ...p, feePercent: Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <span className="text-[10px] text-slate-500">{(formData.feePercent / 100).toFixed(2)}%</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feeMin" className="text-slate-400">Min Fee (Rp)</Label>
                                <Input
                                    id="feeMin"
                                    type="number"
                                    min="0"
                                    placeholder="Opsional"
                                    value={formData.feeMin}
                                    onChange={(e) => setFormData((p) => ({ ...p, feeMin: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feeMax" className="text-slate-400">Max Fee (Rp)</Label>
                                <Input
                                    id="feeMax"
                                    type="number"
                                    min="0"
                                    placeholder="Opsional"
                                    value={formData.feeMax}
                                    onChange={(e) => setFormData((p) => ({ ...p, feeMax: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Display Properties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sortOrder" className="text-slate-400">Urutan (Sort Order)</Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                min="0"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iconUrl" className="text-slate-400">URL Icon / Logo</Label>
                            <Input
                                id="iconUrl"
                                placeholder="E.g., /images/bca.png"
                                value={formData.iconUrl}
                                onChange={(e) => setFormData((p) => ({ ...p, iconUrl: e.target.value }))}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    </div>

                    {/* Is Active Status Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 mt-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">Aktifkan Channel</Label>
                            <p className="text-xs text-slate-500">Tampilkan channel ini sebagai metode pembayaran aktif.</p>
                        </div>
                        <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData((p) => ({ ...p, isActive: checked }))}
                        />
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
