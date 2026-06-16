"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { Order } from "../types";

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  SUCCESS: { label: "Berhasil", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  PROCESSING: { label: "Proses", color: "bg-blue-500/10 text-blue-450 border-blue-500/20", icon: RefreshCw },
  FAILED: { label: "Gagal", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: XCircle },
  REFUNDED: { label: "Refund", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: AlertCircle },
  CANCELED: { label: "Dibatalkan", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: XCircle },
};

function getStatusDisplay(statusCode: string) {
  return statusMap[statusCode] || { label: statusCode, color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: AlertCircle };
}

export default function OrderDetailModal({ open, onOpenChange, order }: OrderDetailModalProps) {
  if (!order) return null;

  const statusConfig = getStatusDisplay(order.status);
  const Icon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 rounded-3xl p-0 overflow-hidden text-slate-700 dark:text-slate-200 shadow-2xl">
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <DialogTitle className="text-xl font-bold">Detail Order</DialogTitle>
          <p className="text-xs text-blue-200 mt-1">Status dan kelengkapan order game</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{order.productName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Trx ID: {order.trxId}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                <Icon className="size-3.5" />
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Tanggal Order</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{new Date(order.createdAt).toLocaleString("id-ID")}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Metode Pembayaran</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Customer</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{order.user?.name || "Guest"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Channel</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{order.salesChannel}</span>
            </div>
            <div className="col-span-2 border-t border-slate-200 dark:border-white/5 my-2 pt-2"></div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">User ID / Server ID</span>
              <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">
                {order.dataNo}
                {order.dataId ? ` (${order.dataId})` : ""}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Serial Number / SN</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-200 font-semibold break-all bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 block mt-1">
                {order.sn || "Belum tersedia"}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-4">
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">Ringkasan Pembayaran</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Harga Jual</span>
                <span className="text-slate-700 dark:text-slate-200">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Harga Modal (Base)</span>
                <span className="text-slate-700 dark:text-slate-200">Rp {order.basePrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Estimasi Profit</span>
                <span>Rp {order.profit.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-white/5 my-2"></div>
              <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white">
                <span>Total Bayar</span>
                <span className="text-blue-600 dark:text-blue-400">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl h-10 transition-all" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
