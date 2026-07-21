"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    Edit2,
    ToggleLeft,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import {
    fetchPaymentMethodsAdmin,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethodStatus,
    PaymentMethod,
} from "@/services/paymentMethod.admin.client";
import PaymentMethodFormDialog from "./payment-method-form-dialog";
import { toast } from "react-hot-toast";

export default function PaymentMethodsTable() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    // Form dialog states
    const [formOpen, setFormOpen] = useState(false);
    const [selectedPM, setSelectedPM] = useState<PaymentMethod | null>(null);

    const { data: paymentMethods = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["adminPaymentMethods", { category }],
        queryFn: () => fetchPaymentMethodsAdmin({ category: category || undefined }),
    });

    // Toggle status mutation
    const toggleMutation = useMutation({
        mutationFn: (id: string) => togglePaymentMethodStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
            toast.success("Status metode pembayaran berhasil diubah");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal mengubah status");
        },
    });

    // Save/Create mutation
    const saveMutation = useMutation({
        mutationFn: ({ id, data }: { id?: string; data: Partial<PaymentMethod> }) => {
            if (id) {
                return updatePaymentMethod(id, data);
            } else {
                return createPaymentMethod(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
        },
    });

    const handleSave = async (data: Partial<PaymentMethod>) => {
        await saveMutation.mutateAsync({
            id: selectedPM?.id,
            data,
        });
    };

    const handleOpenCreate = () => {
        setSelectedPM(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (pm: PaymentMethod) => {
        setSelectedPM(pm);
        setFormOpen(true);
    };

    // Filter by client search
    const filteredPMs = paymentMethods.filter((pm) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
            pm.code.toLowerCase().includes(query) ||
            pm.name.toLowerCase().includes(query) ||
            pm.provider.toLowerCase().includes(query)
        );
    });

    // Stats calculations
    const totalCount = paymentMethods.length;
    const activeCount = paymentMethods.filter((p) => p.isActive).length;
    const inactiveCount = totalCount - activeCount;

    const formatFee = (pm: PaymentMethod) => {
        switch (pm.feeType) {
            case "NONE":
                return "Gratis (0)";
            case "FLAT":
                return `Rp ${pm.feeFlat.toLocaleString("id-ID")}`;
            case "PERCENT":
                return `${(pm.feePercent / 100).toFixed(2)}%`;
            case "FLAT_PERCENT":
                return `Rp ${pm.feeFlat.toLocaleString("id-ID")} + ${(pm.feePercent / 100).toFixed(2)}%`;
            default:
                return "-";
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#081e3d_45%,#071a33_100%)] shadow-[0_20px_80px_rgba(37,99,235,0.08)] p-6">
                <div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
                            <CreditCard className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Metode Pembayaran</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Kelola channel pembayaran, provider gateway, dan biaya admin transaksi.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-800"
                        >
                            <RefreshCw className="size-4 mr-2" /> Segarkan
                        </Button>
                        <Button
                            onClick={handleOpenCreate}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            <Plus className="size-4 mr-2" /> Tambah Channel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Channel</CardDescription>
                            <CardTitle className="text-3xl font-bold">{totalCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                            <CreditCard className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Aktif</CardDescription>
                            <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <CheckCircle2 className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nonaktif</CardDescription>
                            <CardTitle className="text-3xl font-bold text-slate-550 dark:text-slate-400">{inactiveCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl">
                            <XCircle className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Table card */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Channel Pembayaran</CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Konfigurasi fee, provider backend, dan status tampilan.
                        </CardDescription>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode/nama..."
                                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs px-3 focus:outline-none"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="balance">Saldo (Balance)</option>
                            <option value="qris">QRIS</option>
                            <option value="e-wallet">E-Wallet</option>
                            <option value="bank-transfer">Virtual Account</option>
                            <option value="other">Lainnya</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setCategory("");
                            }}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-500 dark:text-slate-400"
                        >
                            <Filter className="size-4 mr-2" /> Reset
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="w-16 text-slate-500 dark:text-slate-400 font-bold text-center">Urutan</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Icon</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Kode</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Nama</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Kategori</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Provider</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Biaya Admin</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Dibebankan Ke</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="size-8 animate-spin text-blue-500" />
                                                <p className="text-sm font-medium">Memuat data channel...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-20 text-center text-rose-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="size-10 text-rose-500" />
                                                <p className="text-sm font-bold">Terjadi Kesalahan</p>
                                                <p className="text-xs text-slate-400">{(error as Error).message}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPMs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <CreditCard className="size-10 text-slate-400 dark:text-slate-600" />
                                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    Tidak ada channel pembayaran
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    Silakan klik "Tambah Channel" untuk menambahkan metode pembayaran.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPMs.map((pm) => (
                                        <TableRow
                                            key={pm.id}
                                            className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <TableCell className="text-center font-bold text-xs text-slate-500 dark:text-slate-400">
                                                {pm.sortOrder}
                                            </TableCell>
                                            <TableCell>
                                                {pm.iconUrl ? (
                                                    <img
                                                        src={pm.iconUrl}
                                                        alt={pm.name}
                                                        className={`size-8 object-contain rounded-md bg-slate-800/10 p-0.5 ${pm.category === "qris" ? "dark:invert" : ""}`}
                                                        onError={(e) => {
                                                            (e.target as HTMLElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="size-8 rounded bg-slate-800/20 text-xs font-bold flex items-center justify-center">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {pm.code}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                                                {pm.name}
                                            </TableCell>
                                            <TableCell className="capitalize text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {pm.category === "bank-transfer" ? "Virtual Account" : pm.category}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold border-slate-200 dark:border-slate-800"
                                                >
                                                    {pm.provider}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-slate-900 dark:text-slate-300">
                                                {formatFee(pm)}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                {pm.feeChargedTo === "CUSTOMER" ? "Customer" : "Merchant (Toko)"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={pm.isActive}
                                                        disabled={toggleMutation.isPending}
                                                        onCheckedChange={() => toggleMutation.mutate(pm.id)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(pm)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PaymentMethodFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                paymentMethod={selectedPM}
                onSave={handleSave}
            />
        </div>
    );
}
