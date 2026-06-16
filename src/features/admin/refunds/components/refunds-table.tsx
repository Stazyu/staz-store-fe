"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RotateCcw, Eye, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { fetchAdminRefunds, Refund } from "@/services/refund.client";

export default function RefundsTable() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailId, setDetailId] = useState<string | null>(null);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminRefunds', { search, startDate, endDate, limit: pageSize, offset }],
    queryFn: () => fetchAdminRefunds({ search, startDate, endDate, limit: pageSize, offset }),
  });

  const refunds = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const activeDetailRefund = refunds.find(r => r.trxId === detailId);

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
              <RotateCcw className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Refund</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Daftar transaksi order gagal yang telah dikembalikan (refund) ke saldo customer.</p>
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
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Refund</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Riwayat refund ke customer dari order game yang gagal.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari invoice/customer..."
                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm focus:ring-blue-500/20"
              />
            </div>
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
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Invoice</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Customer</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Source</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Nominal</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Metode Refund</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Alasan</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Tanggal</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="size-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Memuat data refund...</p>
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
                ) : refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <RotateCcw className="size-10 text-slate-400 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada data refund</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Tidak ada log transaksi refund saldo yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund, idx) => {
                    return (
                      <TableRow key={refund.id} className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-500 dark:text-slate-400">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{refund.trxId}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{refund.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{refund.user?.email || ""}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300 font-medium">{refund.trxFrom}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-900 dark:text-slate-200">
                          Rp {refund.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300 font-medium">{refund.paymentMethod}</TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-[180px] truncate" title={refund.message || ""}>
                          {refund.message || "Order Gagal / Di-Refund"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                            <CheckCircle2 className="size-3" />
                            Refunded
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(refund.updatedAt || refund.createdAt).toLocaleString("id-ID", {
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
                            onClick={() => setDetailId(refund.trxId)}
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
        {!isLoading && refunds.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} transaksi refund
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
          <div className="bg-linear-to-r from-blue-700 to-indigo-600 p-6 text-white">
            <DialogTitle className="text-xl font-bold">Detail Refund</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Detail pengembalian dana transaksi</p>
          </div>
          {activeDetailRefund && (
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeDetailRefund.productName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Invoice: {activeDetailRefund.trxId}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                  Refunded
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Customer</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailRefund.user?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Telepon Customer</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailRefund.user?.phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Metode Refund</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailRefund.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Source</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailRefund.trxFrom}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Diajukan</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(activeDetailRefund.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Refunded</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(activeDetailRefund.updatedAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Alasan / Pesan</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">{activeDetailRefund.message || "Order Gagal / Di-Refund"}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-base text-slate-900 dark:text-white">
                  <span>Nominal Pengembalian</span>
                  <span>Rp {activeDetailRefund.price.toLocaleString("id-ID")}</span>
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
