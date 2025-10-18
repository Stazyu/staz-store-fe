// components/admin/TransactionList.tsx
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiEye } from "react-icons/fi";
import { TransactionDetailModal } from "./TransactionDetailModal";

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
    success: { label: 'Berhasil', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Trx</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.idTrx}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusMap[transaction.status].color}`}>
                      {statusMap[transaction.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {transaction.total.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(transaction)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiEye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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