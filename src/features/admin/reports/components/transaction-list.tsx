// components/admin/TransactionList.tsx
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiEye } from "react-icons/fi";
import { TransactionDetailModal } from "./transaction-detail-modal";

export interface Transaction {
  id: string;
  idTrx: string;
  trxDari: string;
  customer: string;
  product: string;
  date: string;
  status: "success" | "pending" | "failed";
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  destinationNumber?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const statusMap = {
    success: { label: 'Berhasil', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' },
    pending: { label: 'Pending', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' },
    failed: { label: 'Gagal', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' },
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold">ID Trx</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Pelanggan</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Produk</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Tanggal</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Status</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <TableCell className="font-semibold text-slate-900 dark:text-white">{transaction.idTrx}</TableCell>
                  <TableCell className="text-slate-800 dark:text-slate-200">{transaction.customer}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{transaction.product}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{new Date(transaction.date).toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center ${statusMap[transaction.status].color}`}>
                      {statusMap[transaction.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                    Rp {transaction.total.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(transaction)}
                      className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <FiEye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400 dark:text-slate-550">
                  Tidak ada data transaksi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
}