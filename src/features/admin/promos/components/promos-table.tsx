"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TicketPercent,
    Plus,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    Edit2,
    Eye,
    Trash2,
    CheckCircle,
    Calendar,
    Clock,
} from "lucide-react";
import {
    fetchPromosAdmin,
    createPromo,
    updatePromo,
    updatePromoStatus,
    deletePromo,
    Promo,
} from "@/services/promo.client";
import { formatPromoValue, formatDateRange } from "@/lib/utils";
import PromoFormDialog from "./promo-form-dialog";
import PromoDetailDialog from "./promo-detail-dialog";
import { toast } from "react-hot-toast";

export default function PromosTable() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");

    // Dialog states
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

    const { data: promos = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["adminPromos", { status, type }],
        queryFn: () => fetchPromosAdmin({
            status: (status && status !== "all") ? status : undefined,
            type: (type && type !== "all") ? type : undefined,
        }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updatePromoStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPromos"] });
            toast.success("Status promo berhasil diubah");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal mengubah status");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePromo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPromos"] });
            toast.success("Promo berhasil dihapus");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal menghapus promo");
        },
    });

    const saveMutation = useMutation({
        mutationFn: ({ id, data }: { id?: string; data: any }) => {
            if (id) {
                return updatePromo(id, data);
            } else {
                return createPromo(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPromos"] });
        },
    });

    const handleSave = async (data: any) => {
        await saveMutation.mutateAsync({
            id: selectedPromo?.id,
            data,
        });
    };

    const handleToggleStatus = (promo: Promo, checked: boolean) => {
        const nextStatus = checked ? "ACTIVE" : "INACTIVE";
        toggleStatusMutation.mutate({ id: promo.id, status: nextStatus });
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus promo ini?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleOpenCreate = () => {
        setSelectedPromo(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (promo: Promo) => {
        setSelectedPromo(promo);
        setFormOpen(true);
    };

    const handleOpenDetail = (promo: Promo) => {
        setSelectedPromo(promo);
        setDetailOpen(true);
    };

    const filteredPromos = promos.filter((p) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
            p.code.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query)
        );
    });

    const totalCount = promos.length;
    const activeCount = promos.filter((p) => p.status === "ACTIVE").length;
    const scheduledCount = promos.filter((p) => p.status === "SCHEDULED").length;
    const expiredCount = promos.filter((p) => p.status === "EXPIRED").length;

    const statusBadges = {
        ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400",
        INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
        SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400",
        EXPIRED: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-400",
        EXHAUSTED: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400",
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
                            <TicketPercent className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Promo & Voucher</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Buat, kelola, dan pantau log penggunaan kode voucher dan cashback transaksi.
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
                            <Plus className="size-4 mr-2" /> Buat Promo
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Promo</CardDescription>
                            <CardTitle className="text-3xl font-bold">{totalCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                            <TicketPercent className="size-5" />
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
                            <CheckCircle className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Terjadwal</CardDescription>
                            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scheduledCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-655 dark:text-blue-400 rounded-xl">
                            <Calendar className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
                        <div className="space-y-1">
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kedaluwarsa</CardDescription>
                            <CardTitle className="text-3xl font-bold text-rose-600 dark:text-rose-400">{expiredCount}</CardTitle>
                        </div>
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                            <Clock className="size-5" />
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Table card */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Aturan Promo</CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Pengelolaan voucher, target spesifik produk, kuota pemakaian, dan log.
                        </CardDescription>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-44">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode/nama..."
                                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm"
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[145px] h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 rounded-md">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                                <SelectItem value="EXHAUSTED">EXHAUSTED</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[155px] h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 rounded-md">
                                <SelectValue placeholder="Semua Benefit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Benefit</SelectItem>
                                <SelectItem value="DISCOUNT_FIXED">Diskon Tetap</SelectItem>
                                <SelectItem value="DISCOUNT_PERCENT">Diskon Persen</SelectItem>
                                <SelectItem value="CASHBACK_FIXED">Cashback Tetap</SelectItem>
                                <SelectItem value="CASHBACK_PERCENT">Cashback Persen</SelectItem>
                                <SelectItem value="FEE_WAIVER">Potongan Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setStatus("all");
                                setType("all");
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
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Kode</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Nama Promo</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Benefit</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">Min Trx</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Quota</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Terpakai</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Periode</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Tampilan</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="size-8 animate-spin text-blue-500" />
                                                <p className="text-sm font-medium">Memuat data promo...</p>
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
                                ) : filteredPromos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <TicketPercent className="size-10 text-slate-400 dark:text-slate-600" />
                                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    Tidak ada data promo
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    Klik "Buat Promo" untuk membuat voucher diskon atau cashback baru.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPromos.map((promo) => (
                                        <TableRow
                                            key={promo.id}
                                            className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <TableCell className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                                {promo.code}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{promo.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{promo.description}</p>
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {formatPromoValue(promo.type, promo.value, promo.maxDiscount)}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-slate-900 dark:text-slate-300 text-right">
                                                Rp {promo.minTransaction.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-slate-600 dark:text-slate-400">
                                                {promo.quota}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">
                                                {promo.usedCount}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold ${statusBadges[promo.status]}`}
                                                >
                                                    {promo.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {formatDateRange(promo.startDate, promo.endDate)}
                                            </TableCell>
                                            <TableCell className="text-center text-xs">
                                                {promo.isPublic ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                                                        Publik
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 font-bold">
                                                        Kupon/Klaim
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 whitespace-nowrap space-x-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDetail(promo)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Detail Logs"
                                                >
                                                    <Eye className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(promo)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="size-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-3.5" />
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

            <PromoFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                promo={selectedPromo}
                onSave={handleSave}
            />

            <PromoDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                promo={selectedPromo}
            />
        </div>
    );
}
