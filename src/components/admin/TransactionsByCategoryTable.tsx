"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiDownload, FiRefreshCw, FiSearch, FiLoader, FiFileText } from "react-icons/fi";
import { fetchTransactionsByCategory, fetchAdminTransactions, syncDigiflazz, syncPendingDigiflazz } from "@/services/transaction.client";
import { fetchCategories } from "@/services/category.client";
import { toast } from "react-hot-toast";

const statusMap: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  SUCCESS:    { label: "Berhasil", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  PENDING:    { label: "Pending",  dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20" },
  PROCESSING: { label: "Proses",  dot: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-900/20" },
  FAILED:     { label: "Gagal",   dot: "bg-red-500",     text: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/20" },
  REFUND:     { label: "Refund",  dot: "bg-purple-500",  text: "text-purple-700 dark:text-purple-400",   bg: "bg-purple-50 dark:bg-purple-900/20" },
};

export default function TransactionsByCategoryTable() {
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: categories = [], isLoading: isLoadingCat } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: res, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["transactionsByCategory", categoryId, search, status, startDate, endDate, pageSize, offset],
    queryFn: () => {
      if (categoryId === "all") return fetchAdminTransactions({ search, status, startDate, endDate, limit: pageSize, offset });
      return fetchTransactionsByCategory(categoryId, { search, status, startDate, endDate, limit: pageSize, offset });
    },
  });

  const transactions = res?.data || [];
  const totalItem = res?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize) || 1;
  const detailTrx = transactions.find((t) => t.id === detailId);

  useEffect(() => { setPage(1); }, [categoryId, search, status, startDate, endDate]);

  const s = (code: string) => statusMap[code] || { label: code, dot: "bg-gray-400", text: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/50" };
  const hasFilters = status || startDate || endDate;
  const resetAll = () => { setStartDate(""); setEndDate(""); setStatus(""); setSearch(""); };
  const fmtDate = (d: string) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtDateLong = (d: string) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleExport = (type: "pdf" | "excel") => { alert(`Ekspor ke ${type.toUpperCase()} belum diimplementasikan`); };

  const handleSyncSingle = async (id: string) => {
    try {
      setSyncingIds(prev => new Set(prev).add(id));
      await syncDigiflazz(id);
      toast.success("Transaksi berhasil disinkronkan");
      qc.invalidateQueries({ queryKey: ["transactionsByCategory"] });
      qc.invalidateQueries({ queryKey: ["adminTransactions"] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync transaksi");
    } finally {
      setSyncingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleSyncBulk = async () => {
    try {
      setIsBulkSyncing(true);
      const r = await syncPendingDigiflazz(25);
      toast.success(`Sync selesai: ${r.success || 0} berhasil, ${r.failed || 0} gagal dari ${r.total || 0}`);
      qc.invalidateQueries({ queryKey: ["transactionsByCategory"] });
      qc.invalidateQueries({ queryKey: ["adminTransactions"] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync pending");
    } finally {
      setIsBulkSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Daftar Transaksi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{totalItem} transaksi ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { qc.invalidateQueries({ queryKey: ["transactionsByCategory"] }); }} disabled={isFetching}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50" title="Refresh">
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <Button size="sm" className="gap-1.5 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            onClick={handleSyncBulk} disabled={isBulkSyncing}>
            <FiRefreshCw className={`w-4 h-4 ${isBulkSyncing ? "animate-spin" : ""}`} /> Sync Pending
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-lg" onClick={() => handleExport("pdf")}>
            <FiDownload className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-lg" onClick={() => handleExport("excel")}>
            <FiDownload className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={isLoadingCat}
              className="h-9 border rounded-lg px-3 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 min-w-[180px]">
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            <div className="relative w-full md:w-auto">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari ID, produk, user..." className="pl-9 h-9 text-sm rounded-lg w-full md:w-52" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="h-9 border rounded-lg px-3 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="SUCCESS">Berhasil</option>
              <option value="PROCESSING">Proses</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Gagal</option>
              <option value="REFUND">Refund</option>
            </select>
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
            <p className="text-sm font-medium text-red-600">Gagal mengambil data: {(error as Error).message}</p>
          </div>
        )}

        {/* Table */}
        {!isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 dark:border-gray-800">
                  <TableHead className="w-14 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">ID Transaksi</TableHead>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs min-w-[180px]">Produk</TableHead>
                  <TableHead className="text-xs">Kategori</TableHead>
                  <TableHead className="text-xs">Nominal</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Metode Bayar</TableHead>
                  <TableHead className="text-xs">Sumber</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs text-right pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={11} className="h-48 text-center"><FiLoader className="animate-spin text-xl text-gray-400 mx-auto" /></TableCell></TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((trx, idx) => {
                    const st = s(trx.status);
                    return (
                      <TableRow key={trx.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell className="text-center text-sm text-gray-400">{offset + idx + 1}</TableCell>
                        <TableCell className="font-medium text-sm text-blue-600 dark:text-blue-400">{trx.id}</TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">{trx.userName || "Guest"}</TableCell>
                        <TableCell className="font-medium text-sm text-gray-900 dark:text-white">{trx.metadata?.productName || trx.description}</TableCell>
                        <TableCell>
                          <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                            {trx.metadata?.categoryName || "—"}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">Rp {trx.amount.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>{st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{trx.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{trx.metadata?.salesChannel || "WEB"}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(trx.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-0.5 pr-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(trx.id)} title="Detail"><FiEye className="w-3.5 h-3.5" /></Button>
                            {(trx.status === "PENDING" || trx.status === "PROCESSING") && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                onClick={() => handleSyncSingle(trx.id)} disabled={syncingIds.has(trx.id)} title="Sync Digiflazz">
                                <FiRefreshCw className={`w-3.5 h-3.5 ${syncingIds.has(trx.id) ? "animate-spin" : ""}`} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={11} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiFileText className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
                      <p className="text-xs text-gray-400">Tidak ada transaksi yang sesuai filter</p>
                    </div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && transactions.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">{offset + 1}–{Math.min(offset + pageSize, totalItem)} dari {totalItem}</span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-8 text-xs rounded-lg">Sebelumnya</Button>
              <span className="text-xs text-gray-500 px-2">{page}/{totalPage}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPage} onClick={() => setPage(p => p + 1)} className="h-8 text-xs rounded-lg">Berikutnya</Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detail Transaksi</DialogTitle></DialogHeader>
          {detailTrx && (
            <div className="space-y-4 text-sm">
              {/* Product & Status */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{detailTrx.metadata?.productName || detailTrx.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detailTrx.id}</p>
                </div>
                {(() => { const st = s(detailTrx.status); return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>{st.label}
                  </span>
                ); })()}
              </div>

              {/* System Message */}
              {detailTrx.metadata?.message && (
                <div className={`p-3 rounded-lg text-xs ${detailTrx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : detailTrx.status === "FAILED" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"}`}>
                  <strong>Pesan:</strong> {detailTrx.metadata.message}
                </div>
              )}

              {/* Info Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Waktu</p><p className="font-medium text-gray-900 dark:text-white">{fmtDateLong(detailTrx.createdAt)}</p></div>
                  <div><p className="text-xs text-gray-500">Metode Bayar</p><p className="font-medium text-gray-900 dark:text-white">{detailTrx.paymentMethod || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">Pelanggan</p><p className="font-medium text-gray-900 dark:text-white">{detailTrx.userName}</p></div>
                  <div><p className="text-xs text-gray-500">Sumber</p><p className="font-medium text-gray-900 dark:text-white">{detailTrx.metadata?.salesChannel || "WEB"}</p></div>
                </div>
                {detailTrx.metadata?.dataNo && (
                  <div>
                    <p className="text-xs text-gray-500">Tujuan (No/ID/Zone)</p>
                    <p className="font-medium text-gray-900 dark:text-white">{detailTrx.metadata.dataNo}{detailTrx.metadata.dataId ? ` (${detailTrx.metadata.dataId})` : ""}</p>
                  </div>
                )}
                {detailTrx.metadata?.sn && (
                  <div>
                    <p className="text-xs text-gray-500">Serial Number / SN</p>
                    <p className="font-mono font-medium text-gray-900 dark:text-white break-all bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{detailTrx.metadata.sn}</p>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Rincian Harga</p>
                <div className="flex justify-between"><span className="text-gray-500">Harga Produk</span><span className="text-gray-900 dark:text-white">Rp {(Number(detailTrx.amount) - Number(detailTrx.metadata?.profit || 0)).toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Biaya Layanan</span><span className="text-gray-900 dark:text-white">Rp 0</span></div>
                {detailTrx.metadata?.profit !== undefined && (
                  <div className="flex justify-between bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Estimasi Profit</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">+ Rp {Number(detailTrx.metadata.profit).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Rp {detailTrx.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailId(null)} className="w-full">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
