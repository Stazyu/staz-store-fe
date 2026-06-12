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
  ORDER_REFUND: { label: "Refund Order", color: "bg-sky-500/10 text-sky-400 border-sky-550/20", isDebit: false },
  ADJUSTMENT: { label: "Penyesuaian", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", isDebit: false }, // Can be debit/credit, let's look at amount
  BONUS: { label: "Bonus/Komisi", color: "bg-purple-500/10 text-purple-400 border-purple-550/20", isDebit: false },
  FEE: { label: "Biaya Transaksi", color: "bg-slate-500/10 text-slate-400 border-slate-550/20", isDebit: true },
};

export default function BalanceMutationsPage() {
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
      <div className="relative overflow-hidden rounded-3xl p-6 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
              <ArrowLeftRight className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Mutasi Saldo</h1>
              <p className="text-sm text-slate-400">Semua riwayat saldo masuk dan keluar milik seluruh customer.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="size-4 mr-2" /> Segarkan
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850">
          <div>
            <CardTitle className="text-lg font-bold">Daftar Mutasi Saldo</CardTitle>
            <CardDescription className="text-xs text-slate-450">Catatan log audit perubahan saldo customer secara terperinci.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari user/reference..."
                className="pl-9 h-9 border-slate-800 bg-slate-905/60 text-slate-350 text-sm focus:ring-blue-500/20"
              />
            </div>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="border border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Tipe</option>
              <option value="TOPUP">TOPUP</option>
              <option value="ORDER_DEBIT">ORDER_DEBIT</option>
              <option value="ORDER_REFUND">ORDER_REFUND</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
              <option value="BONUS">BONUS</option>
              <option value="FEE">FEE</option>
            </select>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-36 h-9 border-slate-800 bg-slate-900 text-slate-300 text-xs"
            />
            <span className="text-slate-600 text-sm">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-36 h-9 border-slate-800 bg-slate-900 text-slate-300 text-xs"
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
              className="border-slate-800 hover:bg-slate-800 text-slate-400"
            >
              <Filter className="size-4 mr-2" /> Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-slate-450 font-bold">No</TableHead>
                  <TableHead className="text-slate-400 font-bold">Mutation ID</TableHead>
                  <TableHead className="text-slate-400 font-bold">User</TableHead>
                  <TableHead className="text-slate-400 font-bold">Tipe</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right">Debit (-)</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right">Credit (+)</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right">Balance Before</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right">Balance After</TableHead>
                  <TableHead className="text-slate-400 font-bold">Reference</TableHead>
                  <TableHead className="text-slate-400 font-bold">Tanggal</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
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
                        <ArrowLeftRight className="size-10 text-slate-700" />
                        <p className="text-sm font-semibold text-slate-400">Belum ada data mutasi</p>
                        <p className="text-xs text-slate-500">Tidak ada data riwayat mutasi saldo yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  mutations.map((mutation, idx) => {
                    const displayConfig = getTypeDisplay(mutation.type, mutation.amount);
                    const absAmount = Math.abs(mutation.amount);
                    const before = mutation.balanceAfter - mutation.amount;

                    return (
                      <TableRow key={mutation.id} className="border-slate-900 hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-555">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-400 max-w-[120px] truncate" title={mutation.id}>
                          {mutation.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-200">{mutation.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-500">{mutation.user?.email || ""}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${displayConfig.color}`}>
                            {displayConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-rose-400">
                          {displayConfig.isDebit ? `-Rp ${absAmount.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-400">
                          {!displayConfig.isDebit ? `+Rp ${absAmount.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-400">
                          Rp {before.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-slate-200">
                          Rp {mutation.balanceAfter.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-350">
                          {mutation.reference || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-450 whitespace-nowrap">
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
                            className="size-8 rounded-lg hover:bg-slate-800 hover:text-white"
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
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-850 gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} catatan mutasi
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 border-slate-800 text-slate-400"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs font-bold text-blue-455">{page}</span>
                <span className="text-[10px] text-slate-650">/</span>
                <span className="text-xs font-bold text-slate-500">{totalPage || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage(p => p + 1)}
                className="h-8 border-slate-800 text-slate-400"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-200">
          <div className="bg-linear-to-r from-blue-700 to-indigo-650 p-6 text-white">
            <DialogTitle className="text-xl font-bold">Detail Mutasi Saldo</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Laporan mutasi perubahan dana customer</p>
          </div>
          {activeDetailMutation && (
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Mutasi ID</h3>
                  <p className="text-[10px] font-mono text-slate-450 mt-0.5 break-all">{activeDetailMutation.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeDisplay(activeDetailMutation.type, activeDetailMutation.amount).color}`}>
                    {getTypeDisplay(activeDetailMutation.type, activeDetailMutation.amount).label}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Customer</span>
                  <span>{activeDetailMutation.user?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Telepon Customer</span>
                  <span>{activeDetailMutation.user?.phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Reference ID</span>
                  <span className="font-mono text-blue-400">{activeDetailMutation.reference || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Tanggal Log</span>
                  <span>{new Date(activeDetailMutation.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Saldo Awal</span>
                  <span>Rp {(activeDetailMutation.balanceAfter - activeDetailMutation.amount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Perubahan (Amount)</span>
                  <span className={activeDetailMutation.amount >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {activeDetailMutation.amount >= 0 ? "+" : "-"}Rp {Math.abs(activeDetailMutation.amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-base text-white">
                  <span>Saldo Akhir</span>
                  <span>Rp {activeDetailMutation.balanceAfter.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full border-slate-800" onClick={() => setDetailId(null)}>
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
