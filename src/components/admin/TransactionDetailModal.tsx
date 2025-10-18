// components/admin/TransactionDetailModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from "@/components/admin/TransactionList";

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
    if (!transaction) return null;

    const statusMap = {
        success: { label: 'Berhasil', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
        failed: { label: 'Gagal', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Detail Transaksi</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">ID Transaksi</p>
                            <p className="font-medium">{transaction.idTrx}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status Transaksi</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusMap[transaction.status].color}`}>
                                {statusMap[transaction.status].label}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Metode Pembayaran</p>
                            <p className="font-medium">{transaction.paymentMethod || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status Pembayaran</p>
                            <p className="font-medium">{transaction.paymentStatus || '-'}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Pelanggan</p>
                        <p className="font-medium">{transaction.customer}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Produk</p>
                        <p className="font-medium">{transaction.product}</p>
                    </div>

                    {transaction.destinationNumber && (
                        <div>
                            <p className="text-sm text-gray-500">No Tujuan</p>
                            <p className="font-medium">{transaction.destinationNumber}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Tanggal</p>
                            <p className="font-medium">
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
                            <p className="text-sm text-gray-500">Sumber</p>
                            <p className="font-medium">{transaction.trxDari}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Total Pembayaran</p>
                        <p className="text-xl font-bold">Rp {transaction.total.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}