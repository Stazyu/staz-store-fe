"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchPaymentMethodsAdmin } from "@/services/paymentMethod.admin.client";
import { Promo, PromoTarget } from "@/services/promo.client";
import { toast } from "react-hot-toast";
import { Plus, Trash } from "lucide-react";

interface PromoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promo: Promo | null; // null for create
    onSave: (data: any) => Promise<void>;
}

export default function PromoFormDialog({
    open,
    onOpenChange,
    promo,
    onSave,
}: PromoFormDialogProps) {
    const isEdit = !!promo;
    const [loading, setLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        type: "DISCOUNT_FIXED" as "DISCOUNT_FIXED" | "DISCOUNT_PERCENT" | "CASHBACK_FIXED" | "CASHBACK_PERCENT" | "FEE_WAIVER",
        value: 0,
        maxDiscount: "" as string | number,
        minTransaction: 0,
        quota: 100,
        perUserLimit: "" as string | number,
        perTargetLimit: "" as string | number,
        firstTransactionOnly: false,
        isPublic: false,
        isStackable: false,
        startDate: "",
        endDate: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED",
        targetPaymentMethods: [] as string[],
        minimumMarginAmount: "" as string | number,
        minimumMarginPercent: "" as string | number,
        marginBehavior: "REJECT_PROMO" as "REJECT_PROMO" | "CAP_TO_SAFE_MARGIN",
    });

    const [targets, setTargets] = useState<Omit<PromoTarget, "id" | "promoId">[]>([]);

    // Fetch active payment methods for selection
    const { data: paymentMethods = [] } = useQuery({
        queryKey: ["adminPaymentMethods", { isActive: true }],
        queryFn: () => fetchPaymentMethodsAdmin({ isActive: true }),
        enabled: open,
    });

    useEffect(() => {
        if (promo) {
            setFormData({
                code: promo.code,
                name: promo.name,
                description: promo.description || "",
                type: promo.type || "DISCOUNT_FIXED",
                value: promo.value || 0,
                maxDiscount: promo.maxDiscount !== null ? promo.maxDiscount : "",
                minTransaction: promo.minTransaction || 0,
                quota: promo.quota || 100,
                perUserLimit: promo.perUserLimit !== null ? promo.perUserLimit : "",
                perTargetLimit: promo.perTargetLimit !== null ? promo.perTargetLimit : "",
                firstTransactionOnly: promo.firstTransactionOnly || false,
                isPublic: promo.isPublic || false,
                isStackable: promo.isStackable || false,
                startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : "",
                endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : "",
                status: promo.status || "ACTIVE",
                targetPaymentMethods: promo.targetPaymentMethods || [],
                minimumMarginAmount: promo.minimumMarginAmount !== null ? promo.minimumMarginAmount : "",
                minimumMarginPercent: promo.minimumMarginPercent !== null ? promo.minimumMarginPercent : "",
                marginBehavior: promo.marginBehavior || "REJECT_PROMO",
            });
            setTargets(promo.targets ? promo.targets.map(({ targetType, targetValue }) => ({ targetType, targetValue })) : []);
        } else {
            // Default next month for date range
            const start = new Date();
            const end = new Date();
            end.setMonth(start.getMonth() + 1);

            setFormData({
                code: "",
                name: "",
                description: "",
                type: "DISCOUNT_FIXED",
                value: 0,
                maxDiscount: "",
                minTransaction: 0,
                quota: 100,
                perUserLimit: "",
                perTargetLimit: "",
                firstTransactionOnly: false,
                isPublic: false,
                isStackable: false,
                startDate: start.toISOString().slice(0, 16),
                endDate: end.toISOString().slice(0, 16),
                status: "ACTIVE",
                targetPaymentMethods: [],
                minimumMarginAmount: "",
                minimumMarginPercent: "",
                marginBehavior: "REJECT_PROMO",
            });
            setTargets([]);
        }
    }, [promo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                ...formData,
                value: Number(formData.value),
                minTransaction: Number(formData.minTransaction),
                quota: Number(formData.quota),
                maxDiscount: formData.maxDiscount === "" ? null : Number(formData.maxDiscount),
                perUserLimit: formData.perUserLimit === "" ? null : Number(formData.perUserLimit),
                perTargetLimit: formData.perTargetLimit === "" ? null : Number(formData.perTargetLimit),
                minimumMarginAmount: formData.minimumMarginAmount === "" ? null : Number(formData.minimumMarginAmount),
                minimumMarginPercent: formData.minimumMarginPercent === "" ? null : Number(formData.minimumMarginPercent),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                targets,
            };

            await onSave(payload);
            toast.success(isEdit ? "Promo berhasil diperbarui" : "Promo berhasil dibuat");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTarget = () => {
        setTargets((prev) => [...prev, { targetType: "PRODUCT", targetValue: "" }]);
    };

    const handleRemoveTarget = (index: number) => {
        setTargets((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleTargetChange = (index: number, field: string, val: string) => {
        setTargets((prev) =>
            prev.map((t, idx) => (idx === index ? { ...t, [field]: val } : t))
        );
    };

    const handleTogglePaymentMethod = (pmCode: string) => {
        setFormData((prev) => {
            const exists = prev.targetPaymentMethods.includes(pmCode);
            return {
                ...prev,
                targetPaymentMethods: exists
                    ? prev.targetPaymentMethods.filter((c) => c !== pmCode)
                    : [...prev.targetPaymentMethods, pmCode],
            };
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] bg-slate-900 border border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? "Edit Promo / Voucher" : "Buat Promo / Voucher"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4 text-sm">
                    {/* SECTION 1: Basic Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Informasi Promo</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-slate-400">Kode Promo (Unique)</Label>
                                <Input
                                    id="code"
                                    placeholder="E.g., PROMOMLBB5K"
                                    value={formData.code}
                                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                                    disabled={isEdit && (promo?.usedCount ?? 0) > 0}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-400">Nama Promo</Label>
                                <Input
                                    id="name"
                                    placeholder="E.g., Potongan 5K MLBB"
                                    value={formData.name}
                                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-400">Deskripsi Promo</Label>
                            <Input
                                id="description"
                                placeholder="E.g., Diskon khusus top up diamonds Mobile Legends."
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: Pricing & Types */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Tipe & Nilai</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Tipe Promo</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData((p) => ({ ...p, type: val }))}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                        <SelectValue placeholder="Pilih Tipe Promo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        <SelectItem value="DISCOUNT_FIXED">Potongan Tetap (Rp)</SelectItem>
                                        <SelectItem value="DISCOUNT_PERCENT">Potongan Persen (%)</SelectItem>
                                        <SelectItem value="CASHBACK_FIXED">Cashback Tetap (Rp)</SelectItem>
                                        <SelectItem value="CASHBACK_PERCENT">Cashback Persen (%)</SelectItem>
                                        <SelectItem value="FEE_WAIVER">Gratis Biaya Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value" className="text-slate-400">
                                    {formData.type === "FEE_WAIVER" ? "Nilai (Set to 0)" : formData.type.includes("PERCENT") ? "Nilai (%)" : "Nilai (Rp)"}
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="0"
                                    value={formData.value}
                                    onChange={(e) => setFormData((p) => ({ ...p, value: Number(e.target.value) }))}
                                    disabled={formData.type === "FEE_WAIVER"}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxDiscount" className="text-slate-400">Maksimal Diskon (Rp)</Label>
                                <Input
                                    id="maxDiscount"
                                    type="number"
                                    min="0"
                                    placeholder="Opsional (E.g., 10000)"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData((p) => ({ ...p, maxDiscount: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    disabled={!formData.type.includes("PERCENT")}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minTransaction" className="text-slate-400">Min Transaksi (Rp)</Label>
                                <Input
                                    id="minTransaction"
                                    type="number"
                                    min="0"
                                    value={formData.minTransaction}
                                    onChange={(e) => setFormData((p) => ({ ...p, minTransaction: Number(e.target.value) }))}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Usage Limits */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Batas Pemakaian & Kuota</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quota" className="text-slate-400">Total Kuota</Label>
                                <Input
                                    id="quota"
                                    type="number"
                                    min="1"
                                    value={formData.quota}
                                    onChange={(e) => setFormData((p) => ({ ...p, quota: Number(e.target.value) }))}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="perUserLimit" className="text-slate-400">Limit per User</Label>
                                <Input
                                    id="perUserLimit"
                                    type="number"
                                    min="1"
                                    placeholder="Opsional"
                                    value={formData.perUserLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, perUserLimit: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="perTargetLimit" className="text-slate-400">Limit per Target ID</Label>
                                <Input
                                    id="perTargetLimit"
                                    type="number"
                                    min="1"
                                    placeholder="Opsional"
                                    value={formData.perTargetLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, perTargetLimit: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Switches */}
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="flex items-center justify-between p-2 rounded bg-slate-850 border border-slate-800">
                                <Label htmlFor="isPublic" className="cursor-pointer text-xs">Tampil Publik</Label>
                                <Switch
                                    id="isPublic"
                                    checked={formData.isPublic}
                                    onCheckedChange={(c) => setFormData((p) => ({ ...p, isPublic: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-slate-850 border border-slate-800">
                                <Label htmlFor="firstTransactionOnly" className="cursor-pointer text-xs">First Trx Only</Label>
                                <Switch
                                    id="firstTransactionOnly"
                                    checked={formData.firstTransactionOnly}
                                    onCheckedChange={(c) => setFormData((p) => ({ ...p, firstTransactionOnly: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-slate-850 border border-slate-800">
                                <Label htmlFor="isStackable" className="cursor-pointer text-xs">Stackable (Gabung)</Label>
                                <Switch
                                    id="isStackable"
                                    checked={formData.isStackable}
                                    onCheckedChange={(c) => setFormData((p) => ({ ...p, isStackable: c }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Period */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Periode Aktif</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-slate-400">Tanggal Mulai</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-slate-400">Tanggal Berakhir</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Targeting Rules */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Aturan Target (Payment & Entities)</h3>

                        {/* Payment method target selection */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-400 block">Batasi ke Metode Pembayaran (Jika kosong, berlaku semua)</Label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {paymentMethods.map((pm) => {
                                    const selected = formData.targetPaymentMethods.includes(pm.code);
                                    return (
                                        <Button
                                            key={pm.id}
                                            type="button"
                                            size="sm"
                                            onClick={() => handleTogglePaymentMethod(pm.code)}
                                            variant={selected ? "default" : "outline"}
                                            className={selected ? "bg-blue-600 hover:bg-blue-700 text-white font-bold" : "border-slate-800 text-slate-400"}
                                        >
                                            {pm.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Entities targets */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-slate-400">Target Specific Products/Brands (Jika kosong, berlaku semua)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddTarget}
                                    className="h-8 border-slate-800 text-blue-400 hover:bg-slate-800"
                                >
                                    <Plus className="size-3.5 mr-1.5" /> Tambah Rule Target
                                </Button>
                            </div>

                            {targets.map((target, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <Select
                                        value={target.targetType}
                                        onValueChange={(val: any) => handleTargetChange(index, "targetType", val)}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            <SelectItem value="PRODUCT">PRODUCT (ID)</SelectItem>
                                            <SelectItem value="BRAND">BRAND (ID)</SelectItem>
                                            <SelectItem value="CATEGORY">CATEGORY (ID)</SelectItem>
                                            <SelectItem value="TYPE">TYPE (ID)</SelectItem>
                                            <SelectItem value="PRICING_TIER">PRICING TIER (Code)</SelectItem>
                                            <SelectItem value="USER">USER (ID)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="E.g., BRONZE or UUID"
                                        value={target.targetValue}
                                        onChange={(e) => handleTargetChange(index, "targetValue", e.target.value)}
                                        required
                                        className="bg-slate-800 border-slate-700 text-white flex-1"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveTarget(index)}
                                        className="text-rose-500 hover:text-rose-400 hover:bg-slate-800"
                                    >
                                        <Trash className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 6: Margin Safety */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1">Margin Safety (Proteksi Margin Untung)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minimumMarginAmount" className="text-slate-400">Min Margin Amount (Rp)</Label>
                                <Input
                                    id="minimumMarginAmount"
                                    type="number"
                                    min="0"
                                    placeholder="Opsional"
                                    value={formData.minimumMarginAmount}
                                    onChange={(e) => setFormData((p) => ({ ...p, minimumMarginAmount: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minimumMarginPercent" className="text-slate-400">Min Margin Percent (%)</Label>
                                <Input
                                    id="minimumMarginPercent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Opsional"
                                    value={formData.minimumMarginPercent}
                                    onChange={(e) => setFormData((p) => ({ ...p, minimumMarginPercent: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Tindakan Jika Margin Bocor</Label>
                                <Select
                                    value={formData.marginBehavior}
                                    onValueChange={(val: any) => setFormData((p) => ({ ...p, marginBehavior: val }))}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        <SelectItem value="REJECT_PROMO">Reject Promo (Batalkan)</SelectItem>
                                        <SelectItem value="CAP_TO_SAFE_MARGIN">Cap / Kurangi Nilai Diskon</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
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
