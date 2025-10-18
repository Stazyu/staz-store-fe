import React from 'react';
import { TransactionHistory } from '@/components/transactions/TransactionHistory';

export default function RiwayatTransaksiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Riwayat Transaksi</h1>
      <TransactionHistory />
    </div>
  );
}
