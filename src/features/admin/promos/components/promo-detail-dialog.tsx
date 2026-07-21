"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    fetchPromoRedemptions,
    Promo,
} from "@/services/promo.client";
import { formatPromoValue, formatDateRange } from "@/lib/utils";
import { Calendar, Users, Percent, CheckCircle2, Ticket, RefreshCw, AlertCircle } from "lucide-react";

interface PromoDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promo: Promo | null;
}

export default function PromoDetailDialog({
    open,
    onOpenChange,
    promo,
}: PromoDetailDialogProps) {
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const { data: redemptionData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["promoRedemptions", promo?.id, { limit: pageSize, offset }],
        queryFn: () => fetchPromoRedemptions(promo!.id, { limit: pageSize, offset }),
        enabled: open && !!promo,
    });

    if (!promo) return null;

    const redemptions = redemptionData?.data || [];
    const totalItem = redemptionData?.pagination?.total || 0;
    const totalPage = Math.ceil(totalItem / pageSize);

    const quotaPercent = Math.min(100, Math.round((promo.usedCount / promo.quota) * 100));

    const statusColors = {
        ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        INACTIVE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        EXPIRED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        EXHAUSTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border border-slate-800 text-white max-h-[90vh] overflow-y-auto p-0">
                <div className="bg-linear-to-r from-blue-700 to-indigo-600 p-6 text-white">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl font-bold font-mono">{promo.code}</DialogTitle>
                                <p className="text-xs text-blue-200 mt-1">{promo.name}</p>
                            </div>
                            <Badge className={`border font-semibold ${statusColors[promo.status]}`}>
                                {promo.status}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 text-sm">
                    {/* Progress Quota */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Kuota Terpakai</span>
                            <span>{promo.usedCount} / {promo.quota} Voucher ({quotaPercent}%)</span>
                        </div>
                        <Progress value={quotaPercent} className="h-2 bg-slate-800" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Nilai Benefit</span>
                            <span className="text-base font-bold text-blue-400">
                                {formatPromoValue(promo.type, promo.value, promo.maxDiscount)}
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Min Transaksi</span>
                            <span className="text-base font-bold text-slate-200">
                                Rp {promo.minTransaction.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Batas per User</span>
                            <span className="text-sm font-semibold text-slate-200">
                                {promo.perUserLimit ? `${promo.perUserLimit} Kali` : "Tanpa Batas"}
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Periode Aktif</span>
                            <span className="text-xs text-slate-300 font-medium">
                                {formatDateRange(promo.startDate, promo.endDate)}
                            </span>
                        </div>
                    </div>

                    {/* Target Rules */}
                    {promo.targets && promo.targets.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Target Entitas</h4>
                            <div className="flex flex-wrap gap-2">
                                {promo.targets.map((t) => (
                                    <Badge key={t.id} variant="outline" className="border-slate-800 text-slate-300 text-[10px]">
                                        {t.targetType}: {t.targetValue}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Rules */}
                    {promo.targetPaymentMethods && promo.targetPaymentMethods.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Metode Pembayaran Khusus</h4>
                            <div className="flex flex-wrap gap-2">
                                {promo.targetPaymentMethods.map((pmCode) => (
                                    <Badge key={pmCode} className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                                        {pmCode}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Redemption logs */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Log Penggunaan Voucher</h4>
                            <Button variant="ghost" size="icon" className="size-6 text-slate-500 hover:text-white" onClick={() => refetch()}>
                                <RefreshCw className="size-3.5" />
                            </Button>
                        </div>

                        <div className="border border-slate-800 rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-900 border-b border-slate-800">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold text-slate-500">Invoice</TableHead>
                                        <TableHead className="text-[10px] font-bold text-slate-500">Customer</TableHead>
                                        <TableHead className="text-[10px] font-bold text-slate-500 text-right">Benefit</TableHead>
                                        <TableHead className="text-[10px] font-bold text-slate-500 text-right">Tanggal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                                                <RefreshCw className="size-4 animate-spin text-blue-500 mx-auto mb-2" />
                                                Memuat log...
                                            </TableCell>
                                        </TableRow>
                                    ) : isError ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-rose-500 text-xs">
                                                <AlertCircle className="size-4 mx-auto mb-2" />
                                                Gagal memuat log
                                            </TableCell>
                                        </TableRow>
                                    ) : redemptions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-slate-600 text-xs">
                                                Belum ada pemakaian
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        redemptions.map((r) => (
                                            <TableRow key={r.id} className="border-b border-slate-800 hover:bg-slate-850">
                                                <TableCell className="font-mono text-[10px] text-blue-400 font-semibold">
                                                    {r.order?.trxId}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate text-xs">
                                                    <p className="font-medium text-slate-200">{r.user?.name}</p>
                                                    <p className="text-[9px] text-slate-500 font-mono">{r.targetId || ""}</p>
                                                </TableCell>
                                                <TableCell className="text-right text-xs font-bold text-emerald-400 whitespace-nowrap">
                                                    {r.discountAmount > 0 && `-Rp ${r.discountAmount.toLocaleString()}`}
                                                    {r.cashbackAmount > 0 && `+Rp ${r.cashbackAmount.toLocaleString()}`}
                                                    {r.feeWaiverAmount > 0 && `-Fee Rp ${r.feeWaiverAmount.toLocaleString()}`}
                                                </TableCell>
                                                <TableCell className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                                                    {new Date(r.redeemedAt).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginate */}
                        {!isLoading && redemptions.length > 0 && (
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                                <span>Total: {totalItem} pemakaian</span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="h-6 px-2 text-[10px] border-slate-800 bg-transparent text-slate-400"
                                    >
                                        Prev
                                    </Button>
                                    <span>{page}/{totalPage}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPage}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="h-6 px-2 text-[10px] border-slate-800 bg-transparent text-slate-400"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
