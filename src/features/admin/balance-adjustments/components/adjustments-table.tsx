"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    SlidersHorizontal,
    Search,
    Filter,
    RefreshCw,
    Eye,
    Check,
    Ban,
    RotateCcw,
    Plus,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    TrendingDown,
    CalendarDays,
} from "lucide-react";
import {
    useBalanceAdjustments,
    useBalanceAdjustmentSummary,
    useApproveBalanceAdjustment,
    useRejectBalanceAdjustment,
    useReverseBalanceAdjustment,
} from "@/hooks/useBalanceAdjustmentQuery";
import type { BalanceAdjustment } from "@/services/balanceAdjustment.client";
import CreateAdjustmentDialog from "./create-adjustment-dialog";
import { toast } from "react-hot-toast";

// ─── Status / Type maps ──────────────────────────────────────────────────────

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    APPLIED: { label: "Applied", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    REJECTED: { label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: XCircle },
    REVERSED: { label: "Reversed", color: "bg-slate-500/15 text-slate-400 border-slate-500/20", icon: RotateCcw },
};

const typeMap: Record<string, { label: string; color: string; icon: typeof ArrowUpCircle }> = {
    CREDIT: { label: "Tambah", color: "text-emerald-600 dark:text-emerald-400", icon: ArrowUpCircle },
    DEBIT: { label: "Kurangi", color: "text-rose-600 dark:text-rose-400", icon: ArrowDownCircle },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdjustmentsTable() {
    // Filter state
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<BalanceAdjustment | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | "reverse" | null>(null);

    // Queries
    const offset = (page - 1) * pageSize;
    const { data: response, isLoading, isError, error, refetch } = useBalanceAdjustments({
        search, type: typeFilter, status: statusFilter, startDate, endDate, limit: pageSize, offset,
    });
    const { data: summary } = useBalanceAdjustmentSummary();

    // Mutations
    const approveMutation = useApproveBalanceAdjustment();
    const rejectMutation = useRejectBalanceAdjustment();
    const reverseMutation = useReverseBalanceAdjustment();

    const adjustments = response?.data || [];
    const totalItem = response?.pagination?.total || 0;
    const totalPage = Math.ceil(totalItem / pageSize);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [search, typeFilter, statusFilter, startDate, endDate]);

    const getStatusDisplay = (status: string) =>
        statusMap[status] || { label: status, color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: AlertCircle };

    const getTypeDisplay = (type: string) =>
        typeMap[type] || { label: type, color: "text-slate-500", icon: AlertCircle };

    // Action handlers
    const handleActionClick = (id: string, type: "approve" | "reject" | "reverse") => {
        setActionId(id);
        setActionType(type);
    };

    const confirmAction = async () => {
        if (!actionId || !actionType) return;
        try {
            if (actionType === "approve") {
                await approveMutation.mutateAsync(actionId);
                toast.success("Penyesuaian saldo berhasil disetujui!");
            } else if (actionType === "reject") {
                await rejectMutation.mutateAsync(actionId);
                toast.success("Penyesuaian saldo berhasil ditolak!");
            } else if (actionType === "reverse") {
                await reverseMutation.mutateAsync(actionId);
                toast.success("Penyesuaian saldo berhasil di-reverse!");
            }
            setActionId(null);
            setActionType(null);
        } catch (err: any) {
            toast.error(err.message || "Gagal memproses penyesuaian saldo");
        }
    };

    const actionLabels = {
        approve: { title: "Persetujuan", verb: "menyetujui", btnText: "Ya, Setujui", btnColor: "bg-emerald-600 hover:bg-emerald-500 text-white" },
        reject: { title: "Penolakan", verb: "menolak", btnText: "Ya, Tolak", btnColor: "bg-rose-600 hover:bg-rose-500 text-white" },
        reverse: { title: "Reversal", verb: "me-reverse", btnText: "Ya, Reverse", btnColor: "bg-amber-600 hover:bg-amber-500 text-white" },
    };

    return (
        <div className="space-y-6">
            {/* ─── Hero Header ─────────────────────────────────────────── */}
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
                            <SlidersHorizontal className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                Penyesuaian Saldo
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Tambah atau kurangi saldo user secara manual oleh admin.
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
                            size="sm"
                            onClick={() => setCreateOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                        >
                            <Plus className="size-4 mr-2" /> Buat Penyesuaian
                        </Button>
                    </div>
                </div>
            </div>

            {/* ─── Summary Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Penyesuaian Hari Ini"
                    value={summary?.todayCount ?? 0}
                    icon={CalendarDays}
                    color="blue"
                />
                <SummaryCard
                    title="Saldo Ditambahkan"
                    value={`Rp ${(summary?.totalCredit ?? 0).toLocaleString("id-ID")}`}
                    icon={TrendingUp}
                    color="emerald"
                />
                <SummaryCard
                    title="Saldo Dikurangi"
                    value={`Rp ${(summary?.totalDebit ?? 0).toLocaleString("id-ID")}`}
                    icon={TrendingDown}
                    color="rose"
                />
                <SummaryCard
                    title="Pending Approval"
                    value={summary?.pendingCount ?? 0}
                    icon={Clock}
                    color="amber"
                />
            </div>

            {/* ─── Table Card ──────────────────────────────────────────── */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Daftar Penyesuaian
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Penyesuaian saldo manual oleh admin. Setiap penyesuaian wajib memiliki alasan/catatan.
                        </CardDescription>
                    </div>

                    {/* ─── Filters ──────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari user / ID..."
                                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm focus:ring-blue-500/20"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Semua Tipe</option>
                            <option value="CREDIT" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Tambah</option>
                            <option value="DEBIT" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Kurangi</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Semua Status</option>
                            <option value="PENDING" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Pending</option>
                            <option value="APPLIED" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Applied</option>
                            <option value="REJECTED" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Rejected</option>
                            <option value="REVERSED" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Reversed</option>
                        </select>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
                        />
                        <span className="text-slate-400 dark:text-slate-600 text-sm">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setTypeFilter("");
                                setStatusFilter("");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                    <TableHead className="w-12 text-center text-slate-500 dark:text-slate-400 font-bold">No</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Adjustment ID</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">User</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Admin</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Tipe</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Nominal</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Alasan</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Before</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">After</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Tanggal</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="size-8 animate-spin text-blue-500" />
                                                <p className="text-sm font-medium">Memuat data penyesuaian...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-20 text-center text-rose-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="size-10 text-rose-500" />
                                                <p className="text-sm font-bold">Terjadi Kesalahan</p>
                                                <p className="text-xs text-slate-400">{(error as Error).message}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : adjustments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <SlidersHorizontal className="size-12 text-slate-400 dark:text-slate-600" />
                                                <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
                                                    Belum ada penyesuaian saldo
                                                </p>
                                                <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md">
                                                    Data penyesuaian saldo akan muncul di sini setelah admin membuat koreksi saldo, refund manual, bonus, kompensasi, atau pengurangan saldo.
                                                </p>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setCreateOpen(true)}
                                                    className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                                >
                                                    <Plus className="size-4 mr-2" /> Buat Penyesuaian Saldo
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adjustments.map((adj, idx) => {
                                        const statusConfig = getStatusDisplay(adj.status);
                                        const typeConfig = getTypeDisplay(adj.type);
                                        const StatusIcon = statusConfig.icon;
                                        const TypeIcon = typeConfig.icon;

                                        return (
                                            <TableRow key={adj.id} className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                                <TableCell className="text-center text-xs text-slate-500 dark:text-slate-400">
                                                    {offset + idx + 1}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 max-w-[120px] truncate">
                                                    {adj.id}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                                        {adj.user?.name || "-"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        {adj.user?.email || ""}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-mono max-w-[100px] truncate">
                                                    {adj.adminId}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${typeConfig.color}`}>
                                                        <TypeIcon className="size-3.5" />
                                                        {typeConfig.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm font-bold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                                                    {adj.type === "CREDIT" ? "+" : "-"}Rp {adj.amount.toLocaleString("id-ID")}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-[180px] truncate" title={adj.reason}>
                                                    {adj.reason}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {adj.balanceBefore != null ? `Rp ${adj.balanceBefore.toLocaleString("id-ID")}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {adj.balanceAfter != null ? `Rp ${adj.balanceAfter.toLocaleString("id-ID")}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                                                        <StatusIcon className="size-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(adj.createdAt).toLocaleString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit",
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            size="icon" variant="ghost"
                                                            onClick={() => setDetailItem(adj)}
                                                            className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                            title="Detail"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        {adj.status === "PENDING" && (
                                                            <>
                                                                <Button
                                                                    size="icon" variant="ghost"
                                                                    onClick={() => handleActionClick(adj.id, "approve")}
                                                                    className="size-8 rounded-lg text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10"
                                                                    title="Approve"
                                                                >
                                                                    <Check className="size-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon" variant="ghost"
                                                                    onClick={() => handleActionClick(adj.id, "reject")}
                                                                    className="size-8 rounded-lg text-rose-600 dark:text-rose-500 hover:bg-rose-500/10"
                                                                    title="Reject"
                                                                >
                                                                    <Ban className="size-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {adj.status === "APPLIED" && !adj.reversedBy && (
                                                            <Button
                                                                size="icon" variant="ghost"
                                                                onClick={() => handleActionClick(adj.id, "reverse")}
                                                                className="size-8 rounded-lg text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
                                                                title="Reverse"
                                                            >
                                                                <RotateCcw className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {/* ─── Pagination ──────────────────────────────────────── */}
                {!isLoading && adjustments.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} penyesuaian
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline" size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent"
                            >
                                Sebelumnya
                            </Button>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{page}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{totalPage || 1}</span>
                            </div>
                            <Button
                                variant="outline" size="sm"
                                disabled={page >= totalPage}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent"
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ─── Create Dialog ───────────────────────────────────────── */}
            <CreateAdjustmentDialog open={createOpen} onOpenChange={setCreateOpen} />

            {/* ─── Detail Dialog ───────────────────────────────────────── */}
            <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-900 dark:text-slate-200">
                    <div className="bg-linear-to-r from-blue-700 to-indigo-600 p-6 text-white">
                        <DialogTitle className="text-xl font-bold">Detail Penyesuaian</DialogTitle>
                        <p className="text-xs text-blue-200 mt-1">Detail penyesuaian saldo manual admin</p>
                    </div>
                    {detailItem && (
                        <div className="p-6 space-y-4 text-sm">
                            {/* ID + Status header */}
                            <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all">
                                        {detailItem.id}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {(() => {
                                            const tc = getTypeDisplay(detailItem.type);
                                            const TI = tc.icon;
                                            return (
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold ${tc.color}`}>
                                                    <TI className="size-3.5" />
                                                    {tc.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                {(() => {
                                    const sc = getStatusDisplay(detailItem.status);
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${sc.color}`}>
                                            {sc.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Detail rows */}
                            <div className="space-y-3">
                                <DetailRow label="User" value={`${detailItem.user?.name || "-"} (${detailItem.user?.email || "-"})`} />
                                <DetailRow label="Admin ID" value={detailItem.adminId} mono />
                                {detailItem.approvedBy && <DetailRow label="Approved By" value={detailItem.approvedBy} mono />}
                                <DetailRow
                                    label="Nominal"
                                    value={`${detailItem.type === "CREDIT" ? "+" : "-"}Rp ${detailItem.amount.toLocaleString("id-ID")}`}
                                    bold
                                />
                                <DetailRow label="Alasan" value={detailItem.reason} />
                                <DetailRow
                                    label="Saldo Sebelum"
                                    value={detailItem.balanceBefore != null ? `Rp ${detailItem.balanceBefore.toLocaleString("id-ID")}` : "-"}
                                />
                                <DetailRow
                                    label="Saldo Sesudah"
                                    value={detailItem.balanceAfter != null ? `Rp ${detailItem.balanceAfter.toLocaleString("id-ID")}` : "-"}
                                />
                                {detailItem.reversalOf && <DetailRow label="Reversal dari" value={detailItem.reversalOf} mono />}
                                {detailItem.reversedBy && <DetailRow label="Di-reverse oleh" value={detailItem.reversedBy} mono />}
                                <DetailRow
                                    label="Tanggal"
                                    value={new Date(detailItem.createdAt).toLocaleString("id-ID")}
                                />
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                                    onClick={() => setDetailItem(null)}
                                >
                                    Tutup
                                </Button>
                                {detailItem.status === "PENDING" && (
                                    <Button
                                        onClick={() => {
                                            setDetailItem(null);
                                            handleActionClick(detailItem.id, "approve");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                    >
                                        Setujui
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Action Confirmation Dialog ──────────────────────────── */}
            <Dialog open={!!actionId} onOpenChange={() => { setActionId(null); setActionType(null); }}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Konfirmasi {actionType ? actionLabels[actionType].title : ""} Penyesuaian
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Apakah Anda yakin ingin {actionType ? actionLabels[actionType].verb : ""} penyesuaian saldo{" "}
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{actionId}</span>?
                        </p>
                        {actionType === "approve" && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-medium">
                                ⚠️ Tindakan ini akan langsung mengubah saldo user.
                            </p>
                        )}
                        {actionType === "reverse" && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-medium">
                                ⚠️ Tindakan ini akan membatalkan perubahan saldo dan membuat record reversal baru.
                            </p>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => { setActionId(null); setActionType(null); }}
                            className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={confirmAction}
                            disabled={approveMutation.isPending || rejectMutation.isPending || reverseMutation.isPending}
                            className={actionType ? actionLabels[actionType].btnColor : ""}
                        >
                            {(approveMutation.isPending || rejectMutation.isPending || reverseMutation.isPending)
                                ? "Memproses..."
                                : actionType ? actionLabels[actionType].btnText : ""}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: typeof CalendarDays;
    color: "blue" | "emerald" | "rose" | "amber";
}) {
    const colorMap = {
        blue: {
            bg: "bg-blue-500/10 dark:bg-blue-500/15",
            icon: "text-blue-600 dark:text-blue-400",
            border: "border-blue-200/50 dark:border-blue-500/10",
        },
        emerald: {
            bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
            icon: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-200/50 dark:border-emerald-500/10",
        },
        rose: {
            bg: "bg-rose-500/10 dark:bg-rose-500/15",
            icon: "text-rose-600 dark:text-rose-400",
            border: "border-rose-200/50 dark:border-rose-500/10",
        },
        amber: {
            bg: "bg-amber-500/10 dark:bg-amber-500/15",
            icon: "text-amber-600 dark:text-amber-400",
            border: "border-amber-200/50 dark:border-amber-500/10",
        },
    };

    const c = colorMap[color];

    return (
        <div className={`rounded-2xl border ${c.border} bg-white dark:bg-slate-950/40 p-5 backdrop-blur-md transition-all hover:shadow-md`}>
            <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl ${c.bg}`}>
                    <Icon className={`size-5 ${c.icon}`} />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    mono,
    bold,
}: {
    label: string;
    value: string;
    mono?: boolean;
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span
                className={`text-slate-800 dark:text-slate-200 max-w-[60%] text-right break-all ${mono ? "font-mono text-xs" : ""} ${bold ? "font-bold" : ""}`}
            >
                {value}
            </span>
        </div>
    );
}
