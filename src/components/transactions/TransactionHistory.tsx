'use client';

import React, { useState } from 'react';
import { dummyTransactions } from '@/data/transactions';
import { TransactionItem } from '@/types/transaction';
import { FiChevronDown, FiChevronUp, FiInfo, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const statusStyles = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-400',
    icon: <FiCheckCircle className="h-4 w-4 mr-1" />
  },
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-400',
    icon: <FiClock className="h-4 w-4 mr-1" />
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    icon: <FiXCircle className="h-4 w-4 mr-1" />
  }
};

const statusLabels = {
  success: 'Sukses',
  pending: 'Menunggu',
  failed: 'Gagal'
};

const TransactionCard = ({ transaction, formatDate, formatCurrency }: { 
  transaction: TransactionItem, 
  formatDate: (date: string) => string,
  formatCurrency: (amount: number) => string 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusStyles[transaction.status as keyof typeof statusStyles];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-3">
      <div 
        className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {transaction.gameTitle}
            </h3>
            <div className="ml-2 flex-shrink-0 flex">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {status.icon}
                {statusLabels[transaction.status as keyof typeof statusLabels]}
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
            {transaction.itemName}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(transaction.price)}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isExpanded ? (
            <FiChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <FiChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">ID Order</p>
              <p className="font-mono text-gray-900 dark:text-gray-100 break-all">{transaction.id}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tanggal</p>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.date)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Metode Bayar</p>
              <p className="text-gray-900 dark:text-gray-100 capitalize">{transaction.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Status</p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  {status.icon}
                  {statusLabels[transaction.status as keyof typeof statusLabels]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TransactionHistory = () => {
  const [transactions] = useState<TransactionItem[]>(dummyTransactions);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = statusFilter === 'all'
    ? transactions
    : transactions.filter(tx => tx.status === statusFilter);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-0">Daftar Transaksi</h2>
          <div className="w-full sm:w-48">
            <label htmlFor="status-filter" className="sr-only">Filter Status</label>
            <select
              id="status-filter"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="success">Sukses</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden p-2">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard 
              key={transaction.id} 
              transaction={transaction} 
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
              <FiInfo className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Tidak ada transaksi</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {statusFilter === 'all' 
                ? 'Belum ada riwayat transaksi.' 
                : `Tidak ada transaksi dengan status ${statusLabels[statusFilter as keyof typeof statusLabels]}.`}
            </p>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                ID Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Game & Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Tanggal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Pembayaran
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Harga
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const status = statusStyles[transaction.status as keyof typeof statusStyles];
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-200">
                      <span className="font-medium">#{transaction.id.substring(0, 6)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.gameTitle}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{transaction.itemName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.icon}
                        {statusLabels[transaction.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada transaksi yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
