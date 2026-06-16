"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeftRight, Eye, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { fetchAdminMutations, BalanceMutation } from "@/services/balanceMutation.client";

const typeMap: Record<string, { label: string; color: string; isDebit: boolean }> = {
  TOPUP: { label: "Top-Up Saldo", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", isDebit: false },
  ORDER_DEBIT: { label: "Pembelian", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", isDebit: true },
  ORDER_REFUND: { label: "Refund Order", color: "bg-sky-500/10 text-sky-400 border-sky-500/20", isDebit: false },
  ADJUSTMENT: { label: "Penyesuaian", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", isDebit: false }, // Can be debit/credit, let's look at amount
  BONUS: { label: "Bonus/Komisi", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", isDebit: false },
  FEE: { label: "Biaya Transaksi", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", isDebit: true },
};

export default function MutationsTable() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailId, setDetailId] = useState<string | null>(null);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminMutations', { search, type, startDate, endDate, limit: pageSize, offset }],
    queryFn: () => fetchAdminMutations({ search, type, startDate, endDate, limit: pageSize, offset }),
  });

  const mutations = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, type, startDate, endDate]);

  const getTypeDisplay = (typeCode: string, amount: number) => {
    const config = typeMap[typeCode] || { label: typeCode, color: "bg-gray-500/10 text-gray-400 border-gray-500/20", isDebit: amount < 0 };
    if (typeCode === "ADJUSTMENT") {
      return {
        ...config,
        isDebit: amount < 0,
        label: amount < 0 ? "Penyesuaian (Minus)" : "Penyesuaian (Plus)"
      };
    }
    return config;
  };

  const activeDetailMutation = mutations.find(m => m.id === detailId);

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
              <ArrowLeftRight className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Mutasi Saldo</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Semua riwayat saldo masuk dan keluar milik seluruh customer.</p>
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
          </div>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Mutasi Saldo</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Catatan log audit perubahan saldo customer secara terperinci.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari user/reference..."
                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm focus:ring-blue-500/20"
              />
            </div>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Semua Tipe</option>
              <option value="TOPUP" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">TOPUP</option>
              <option value="ORDER_DEBIT" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">ORDER_DEBIT</option>
              <option value="ORDER_REFUND" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">ORDER_REFUND</option>
              <option value="ADJUSTMENT" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">ADJUSTMENT</option>
              <option value="BONUS" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">BONUS</option>
              <option value="FEE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">FEE</option>
            </select>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
            />
            <span className="text-slate-400 dark:text-slate-600 text-sm">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setType("");
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
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Mutation ID</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">User</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Tipe</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">Debit (-)</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">Credit (+)</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">Balance Before</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">Balance After</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Reference</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Tanggal</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="size-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Memuat data mutasi...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-rose-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-10 text-rose-500" />
                        <p className="text-sm font-bold">Terjadi Kesalahan</p>
                        <p className="text-xs text-slate-400">{(error as Error).message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : mutations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <ArrowLeftRight className="size-10 text-slate-400 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada data mutasi</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Tidak ada data riwayat mutasi saldo yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  mutations.map((mutation, idx) => {
                    const displayConfig = getTypeDisplay(mutation.type, mutation.amount);
                    const absAmount = Math.abs(mutation.amount);
                    const before = mutation.balanceAfter - mutation.amount;

                    return (
                      <TableRow key={mutation.id} className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-500 dark:text-slate-400">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 max-w-[120px] truncate" title={mutation.id}>
                          {mutation.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{mutation.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{mutation.user?.email || ""}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${displayConfig.color}`}>
                            {displayConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-rose-500 dark:text-rose-400">
                          {displayConfig.isDebit ? `-Rp ${absAmount.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {!displayConfig.isDebit ? `+Rp ${absAmount.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500 dark:text-slate-400">
                          Rp {before.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-slate-900 dark:text-slate-200">
                          Rp {mutation.balanceAfter.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {mutation.reference || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(mutation.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDetailId(mutation.id)}
                            className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            title="Detail"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {!isLoading && mutations.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} catatan mutasi
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
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
                variant="outline"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage(p => p + 1)}
                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-900 dark:text-slate-200">
          <div className="bg-linear-to-r from-blue-700 to-indigo-650 p-6 text-white">
            <DialogTitle className="text-xl font-bold">Detail Mutasi Saldo</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Laporan mutasi perubahan dana customer</p>
          </div>
          {activeDetailMutation && (
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Mutasi ID</h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 break-all">{activeDetailMutation.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeDisplay(activeDetailMutation.type, activeDetailMutation.amount).color}`}>
                    {getTypeDisplay(activeDetailMutation.type, activeDetailMutation.amount).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Customer</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailMutation.user?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Telepon Customer</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailMutation.user?.phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{activeDetailMutation.reference || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Log</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(activeDetailMutation.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Saldo Awal</span>
                  <span className="text-slate-800 dark:text-slate-200">Rp {(activeDetailMutation.balanceAfter - activeDetailMutation.amount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Perubahan (Amount)</span>
                  <span className={activeDetailMutation.amount >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                    {activeDetailMutation.amount >= 0 ? "+" : "-"}Rp {Math.abs(activeDetailMutation.amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-base text-slate-900 dark:text-white">
                  <span>Saldo Akhir</span>
                  <span className="text-slate-900 dark:text-white">Rp {activeDetailMutation.balanceAfter.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300" onClick={() => setDetailId(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
