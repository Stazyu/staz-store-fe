// components/admin/TransactionDetailModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from "./transaction-list";

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
    if (!transaction) return null;

    const statusMap = {
        success: { label: 'Berhasil', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' },
        pending: { label: 'Pending', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' },
        failed: { label: 'Gagal', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white font-bold text-xl">Detail Transaksi</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">ID Transaksi</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.idTrx}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Status Transaksi</p>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center ${statusMap[transaction.status].color}`}>
                                {statusMap[transaction.status].label}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Metode Pembayaran</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.paymentMethod || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Status Pembayaran</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.paymentStatus || '-'}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pelanggan</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.customer}</p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Produk</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.product}</p>
                    </div>

                    {transaction.destinationNumber && (
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">No Tujuan</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.destinationNumber}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tanggal</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">
                                {new Date(transaction.date).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sumber</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{transaction.trxDari}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Pembayaran</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">Rp {transaction.total.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}