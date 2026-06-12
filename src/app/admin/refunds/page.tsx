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

export default function RefundsPage() {
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
      <div className="relative overflow-hidden rounded-3xl p-6 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
              <RotateCcw className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Refund</h1>
              <p className="text-sm text-slate-400">Daftar transaksi order gagal yang telah dikembalikan (refund) ke saldo customer.</p>
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
            <CardTitle className="text-lg font-bold">Daftar Refund</CardTitle>
            <CardDescription className="text-xs text-slate-450">Riwayat refund ke customer dari order game yang gagal.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari invoice/customer..."
                className="pl-9 h-9 border-slate-800 bg-slate-905/60 text-slate-350 text-sm focus:ring-blue-500/20"
              />
            </div>
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
                  <TableHead className="text-slate-400 font-bold">Invoice</TableHead>
                  <TableHead className="text-slate-400 font-bold">Customer</TableHead>
                  <TableHead className="text-slate-400 font-bold">Source</TableHead>
                  <TableHead className="text-slate-400 font-bold">Nominal</TableHead>
                  <TableHead className="text-slate-400 font-bold">Metode Refund</TableHead>
                  <TableHead className="text-slate-400 font-bold">Alasan</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">Status</TableHead>
                  <TableHead className="text-slate-400 font-bold">Tanggal</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
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
                        <RotateCcw className="size-10 text-slate-700" />
                        <p className="text-sm font-semibold text-slate-400">Belum ada data refund</p>
                        <p className="text-xs text-slate-500">Tidak ada log transaksi refund saldo yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund, idx) => {
                    return (
                      <TableRow key={refund.id} className="border-slate-900 hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-550">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-400">{refund.trxId}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-200">{refund.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-500">{refund.user?.email || ""}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-350 font-medium">{refund.trxFrom}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-250">
                          Rp {refund.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-sm text-slate-350 font-medium">{refund.paymentMethod}</TableCell>
                        <TableCell className="text-sm text-slate-400 font-medium max-w-[180px] truncate" title={refund.message || ""}>
                          {refund.message || "Order Gagal / Di-Refund"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                            <CheckCircle2 className="size-3" />
                            Refunded
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-450 whitespace-nowrap">
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
        {!isLoading && refunds.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-850 gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} transaksi refund
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
            <DialogTitle className="text-xl font-bold">Detail Refund</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Detail pengembalian dana transaksi</p>
          </div>
          {activeDetailRefund && (
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{activeDetailRefund.productName}</h3>
                  <p className="text-xs text-slate-450 mt-0.5 font-mono">Invoice: {activeDetailRefund.trxId}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Refunded
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Customer</span>
                  <span>{activeDetailRefund.user?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Telepon Customer</span>
                  <span>{activeDetailRefund.user?.phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Metode Refund</span>
                  <span>{activeDetailRefund.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Source</span>
                  <span>{activeDetailRefund.trxFrom}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Tanggal Diajukan</span>
                  <span>{new Date(activeDetailRefund.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Tanggal Refunded</span>
                  <span>{new Date(activeDetailRefund.updatedAt).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-550">Alasan / Pesan</span>
                  <span className="text-rose-400 font-medium">{activeDetailRefund.message || "Order Gagal / Di-Refund"}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-base text-white">
                  <span>Nominal Pengembalian</span>
                  <span>Rp {activeDetailRefund.price.toLocaleString("id-ID")}</span>
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
