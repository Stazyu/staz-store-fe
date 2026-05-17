"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminInvoices, approveInvoice, rejectInvoice } from "@/services/topup.client";
import { AdminTopupInvoice } from "@/types/topup.types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FiEye, FiCheck, FiX, FiRefreshCw, FiSearch,
  FiLoader, FiFileText, FiAlertTriangle, FiFilter
} from "react-icons/fi";
import toast from "react-hot-toast";

const statusMap: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  PAID:      { label: "Disetujui",  dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  PENDING:   { label: "Pending",    dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20" },
  EXPIRED:   { label: "Expired",    dot: "bg-gray-400",    text: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-gray-800/50" },
  CANCELLED: { label: "Dibatalkan", dot: "bg-red-500",     text: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/20" },
};

const PAGE_SIZE = 20;

export default function TopupsTable() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const qp = {
    search: search || undefined, status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    startDate: startDate ? new Date(startDate + "T00:00:00").toISOString() : undefined,
    endDate: endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined,
    limit: PAGE_SIZE, offset,
  };

  const { data: res, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["adminTopupInvoices", qp],
    queryFn: () => getAdminInvoices(qp),
    placeholderData: (prev) => prev,
  });

  const invoices = res?.data || [];
  const totalItem = res?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / PAGE_SIZE) || 1;

  const approveMut = useMutation({
    mutationFn: approveInvoice,
    onSuccess: () => { toast.success("Top up disetujui"); qc.invalidateQueries({ queryKey: ["adminTopupInvoices"] }); setDetailId(null); },
    onError: (e: any) => { toast.error(e.message || "Gagal menyetujui top up"); },
  });
  const rejectMut = useMutation({
    mutationFn: rejectInvoice,
    onSuccess: () => { toast.success("Top up ditolak"); qc.invalidateQueries({ queryKey: ["adminTopupInvoices"] }); setDetailId(null); },
    onError: (e: any) => { toast.error(e.message || "Gagal menolak top up"); },
  });

  useEffect(() => { setPage(1); }, [search, status, paymentMethod, startDate, endDate]);

  const detailInv = invoices.find((t: AdminTopupInvoice) => t.id === detailId);
  const s = (code: string) => statusMap[code] || { label: code, dot: "bg-gray-400", text: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/50" };
  const hasFilters = status || paymentMethod || startDate || endDate;
  const resetAll = () => { setStatus(""); setSearch(""); setPaymentMethod(""); setStartDate(""); setEndDate(""); };

  const fmtDate = (d: string) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtDateLong = (d: string) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Kelola Top Up</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{totalItem} invoice terdaftar</p>
        </div>
        <button onClick={() => qc.invalidateQueries({ queryKey: ["adminTopupInvoices"] })} disabled={isFetching}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50" title="Refresh">
          <FiRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative w-full md:w-auto">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari invoice, nama, email..." className="pl-9 h-9 text-sm rounded-lg w-full md:w-64" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="h-9 border rounded-lg px-3 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Disetujui</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
            <Input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Metode bayar..." className="h-9 text-sm rounded-lg w-full md:w-32" />
            <div className="flex items-center gap-1.5">
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 text-sm rounded-lg w-36" />
              <span className="text-gray-400 text-xs">—</span>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 text-sm rounded-lg w-36" />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetAll} className="h-9 gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                <FiFilter className="w-3.5 h-3.5" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FiAlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Gagal memuat data</p>
            <p className="text-xs text-gray-500">{(error as Error)?.message || "Terjadi kesalahan."}</p>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-lg" onClick={() => qc.invalidateQueries({ queryKey: ["adminTopupInvoices"] })}>
              <FiRefreshCw className="h-3.5 w-3.5" /> Coba Lagi
            </Button>
          </div>
        )}

        {/* Table */}
        {!isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 dark:border-gray-800">
                  <TableHead className="w-14 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Kode Invoice</TableHead>
                  <TableHead className="text-xs">Nama User</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Nominal</TableHead>
                  <TableHead className="text-xs">Metode Bayar</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Dibuat</TableHead>
                  <TableHead className="text-xs">Kadaluarsa</TableHead>
                  <TableHead className="text-xs text-right pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={10} className="h-48 text-center"><FiLoader className="animate-spin text-xl text-gray-400 mx-auto" /></TableCell></TableRow>
                ) : invoices.length > 0 ? (
                  invoices.map((inv: AdminTopupInvoice, idx: number) => {
                    const st = s(inv.status);
                    return (
                      <TableRow key={inv.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell className="text-center text-sm text-gray-400">{offset + idx + 1}</TableCell>
                        <TableCell className="font-medium text-sm text-blue-600 dark:text-blue-400">{inv.invoiceCode}</TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">{inv.user?.name || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{inv.user?.email || "—"}</TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">Rp {inv.amount.toLocaleString("id-ID")}</TableCell>
                        <TableCell><code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">{inv.paymentMethod || "—"}</code></TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(inv.createdAt)}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.expiredAt ? fmtDate(inv.expiredAt) : "—"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-0.5 pr-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(inv.id)} title="Detail"><FiEye className="w-3.5 h-3.5" /></Button>
                            {inv.status === "PENDING" && (<>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                onClick={() => approveMut.mutate(inv.invoiceCode)} disabled={approveMut.isPending || rejectMut.isPending} title="Setujui"><FiCheck className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                onClick={() => rejectMut.mutate(inv.invoiceCode)} disabled={approveMut.isPending || rejectMut.isPending} title="Tolak"><FiX className="w-3.5 h-3.5" /></Button>
                            </>)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiFileText className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
                      <p className="text-xs text-gray-400">Tidak ada invoice yang sesuai filter</p>
                    </div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && invoices.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">{offset + 1}–{Math.min(offset + PAGE_SIZE, totalItem)} dari {totalItem}</span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 text-xs rounded-lg">Sebelumnya</Button>
              <span className="text-xs text-gray-500 px-2">{page}/{totalPage}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPage} onClick={() => setPage(p => p + 1)} className="h-8 text-xs rounded-lg">Berikutnya</Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detail Invoice Top Up</DialogTitle></DialogHeader>
          {detailInv && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500">Total Nominal</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Rp {detailInv.amount.toLocaleString("id-ID")}</p>
                </div>
                {(() => { const st = s(detailInv.status); return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>{st.label}
                  </span>
                ); })()}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Kode Invoice</p><p className="font-medium text-gray-900 dark:text-white">{detailInv.invoiceCode}</p></div>
                  <div><p className="text-xs text-gray-500">Metode Bayar</p><p className="font-medium text-gray-900 dark:text-white">{detailInv.paymentMethod || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Nama User</p><p className="font-medium text-gray-900 dark:text-white">{detailInv.user?.name || "—"}</p></div>
                  <div><p className="text-xs text-gray-500">Email User</p><p className="font-medium text-gray-900 dark:text-white break-all">{detailInv.user?.email || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Dibuat</p><p className="font-medium text-gray-900 dark:text-white">{fmtDateLong(detailInv.createdAt)}</p></div>
                  <div><p className="text-xs text-gray-500">Kadaluarsa</p><p className="font-medium text-gray-900 dark:text-white">{detailInv.expiredAt ? fmtDateLong(detailInv.expiredAt) : "—"}</p></div>
                </div>
                {detailInv.paymentRef && (
                  <div><p className="text-xs text-gray-500">Payment Ref</p><p className="font-mono font-medium text-gray-900 dark:text-white break-all">{detailInv.paymentRef}</p></div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDetailId(null)} className="flex-1">Tutup</Button>
            {detailInv?.status === "PENDING" && (<>
              <Button variant="destructive" className="flex-1 gap-1.5" onClick={() => rejectMut.mutate(detailInv.invoiceCode)}
                disabled={rejectMut.isPending || approveMut.isPending}><FiX className="w-3.5 h-3.5" /> Tolak</Button>
              <Button className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveMut.mutate(detailInv.invoiceCode)}
                disabled={rejectMut.isPending || approveMut.isPending}><FiCheck className="w-3.5 h-3.5" /> Setujui</Button>
            </>)}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
