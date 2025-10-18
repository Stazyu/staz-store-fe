'use client';

import React from 'react';
import { FaCheckCircle, FaCopy, FaClock, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { PAYMENT_METHODS } from '@/constants/paymentMethods';

type Status = 'payment-required' | 'pending' | 'success' | 'failed';

interface OrderProcessingModalProps {
  orderId: string;
  gameId: string;
  gameTitle: string;
  amount: number;
  currency: string;
  price: number;
  paymentType: string;
  status?: Status;
  onClose: () => void;
}

export default function OrderProcessingModal({
  orderId,
  gameId,
  gameTitle,
  amount,
  currency,
  price,
  paymentType,
  status = 'payment-required',
  onClose
}: OrderProcessingModalProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  console.log({
    orderId,
    gameId,
    gameTitle,
    amount,
    currency,
    price,
    paymentType,
    status,
    onClose,
  });

  const copyToClipboard = async (text: string) => {
    try {
      // Gunakan Clipboard API jika tersedia
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback untuk browser yang tidak mendukung Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('ID Transaksi berhasil disalin!');
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
      toast.error('Gagal menyalin ID Transaksi');
    }
  };

  // Function to handle payment redirection
  const handlePayment = () => {
    // In a real app, you would generate a payment URL from your payment gateway
    // For example: const paymentUrl = await generatePaymentGatewayUrl(orderId);
    const paymentUrl = `https://payment-gateway.example.com/pay?order_id=${orderId}&amount=${price}`;

    // Open payment gateway in a new tab
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  // Status configurations
  const statusConfig = {
    'payment-required': {
      icon: <FaClock className="h-8 w-8 text-yellow-500" />,
      title: 'Menunggu Pembayaran',
      message: 'Silakan selesaikan pembayaran untuk melanjutkan transaksi Anda.',
      statusText: 'Menunggu Pembayaran',
      statusClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
      showPaymentButton: true,
      showCloseButton: true,
      details: {
        description: 'Silakan selesaikan pembayaran dalam waktu 24 jam untuk menghindari pembatalan otomatis.',
        instructions: 'Pilih metode pembayaran dan ikuti instruksi untuk menyelesaikan pembayaran.',
        nextSteps: 'Setelah pembayaran berhasil, status akan diperbarui secara otomatis.'
      }
    },
    'pending': {
      icon: <FaClock className="h-8 w-8 text-blue-500" />,
      title: 'Transaksi Dalam Proses',
      message: 'Transaksi Anda sedang diproses dan akan segera dikirim.',
      statusText: 'Menunggu',
      statusClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      showPaymentButton: false,
      showCloseButton: true,
      details: {
        description: 'Transaksi Anda sedang diproses dan akan segera dikirim.',
        instructions: 'Anda akan menerima notifikasi melalui email begitu transaksi selesai diproses.',
        nextSteps: 'Silakan periksa riwayat transaksi Anda untuk melacak status terbaru.'
      }
    },
    'success': {
      icon: <FaCheckCircle className="h-8 w-8 text-green-500" />,
      title: 'Transaksi Berhasil',
      message: 'Transaksi Anda telah berhasil diproses.',
      statusText: 'Berhasil',
      statusClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      showPaymentButton: false,
      showCloseButton: true,
      details: {
        description: 'Transaksi Anda berhasil diproses.',
        instructions: 'Anda akan menerima notifikasi melalui email begitu transaksi selesai diproses.',
        nextSteps: 'Silakan periksa riwayat transaksi Anda untuk melacak status terbaru.'
      }
    },
    'failed': {
      icon: <FaInfoCircle className="h-8 w-8 text-red-500" />,
      title: 'Transaksi Gagal',
      message: `Maaf, transaksi Anda gagal diproses. ${paymentType === 'balance' ? 'Silahkan coba lagi' : 'Silahkan hubungi tim dukungan kami.'}`,
      statusText: 'Gagal',
      statusClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      showPaymentButton: false,
      showCloseButton: true,
      details: {
        description: 'Terjadi kesalahan saat memproses transaksi Anda.',
        instructions: `${paymentType === 'balance' ? 'Silahkan coba lagi' : 'Silahkan hubungi tim dukungan kami. untuk melihat detail transaksi Anda.'}`,
        nextSteps: 'Jika masalah berlanjut, harap hubungi tim dukungan kami.'
      }
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${currentStatus.bgColor} mb-4`}>
              {currentStatus.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {currentStatus.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentStatus.message}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-white dark:bg-gray-700 p-5 rounded-xl border border-gray-200 dark:border-gray-600 mb-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentStatus.statusClass}`}>
                  {currentStatus.statusText}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(new Date())}
              </span>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">ID Transaksi</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {orderId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(orderId)}
                    className={`ml-2 ${status === 'success' ?
                      'text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400' :
                      status === 'failed' ? 'text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400' :
                        status === 'pending' ? 'text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400' :
                          'text-yellow-600 hover:text-yellow-800 dark:text-yellow-500 dark:hover:text-yellow-400'} transition-colors`}
                    aria-label="Salin ID Pesanan"
                  >
                    <FaCopy size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Metode Pembayaran</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right">
                  {PAYMENT_METHODS.find(m => m.id === paymentType)?.name || paymentType}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Game</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right">{gameTitle}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Game ID</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right">{gameId}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Jumlah</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {amount} {currency}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Harga</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(price)}
                </span>
              </div>
            </div>

            {/* Status Details */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Detail Status</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 ${status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : status === 'pending' ? 'text-blue-500' : 'text-yellow-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    {currentStatus.details.description}
                  </p>
                </div>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 ${status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : status === 'pending' ? 'text-blue-500' : 'text-yellow-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    {currentStatus.details.instructions}
                  </p>
                </div>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 ${status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : status === 'pending' ? 'text-blue-500' : 'text-yellow-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    {currentStatus.details.nextSteps}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Payment Instructions for Payment Required Status */}
            {status === 'payment-required' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Cara Pembayaran:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>Pilih metode pembayaran yang tersedia</li>
                  <li>Ikuti instruksi pembayaran yang muncul</li>
                  <li>Simpan bukti pembayaran Anda</li>
                  <li>Pembayaran akan diverifikasi dalam 1x24 jam</li>
                </ol>
              </div>
            )}

            {/* Pending Message for Pending Status */}
            {status === 'pending' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Transaksi Sedang Diproses:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Terima kasih telah melakukan pembayaran. Transaksi Anda sedang diproses. Anda akan segera menerima konfirmasi setelah pembayaran berhasil.
                </p>
              </div>
            )}

            {/* Error Message for Failed Status */}
            {status === 'failed' && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Transaksi Gagal</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>Transaksi Anda tidak dapat diproses. Silahkan hubungi tim dukungan kami untuk informasi lebih lanjut.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Transaksi Berhasil</h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                      <p>Terima kasih! Transaksi Anda berhasil.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 px-6 pb-6">
            {currentStatus.showPaymentButton && (
              <>
                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                >
                  <span>Bayar</span>
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {/* <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Bayar Nanti
                </button> */}
              </>
            )}

            {currentStatus.showCloseButton && (
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Kembali ke Beranda
              </button>
            )}

            <p className="mt-2 text-center text-xs text-gray-500">
              Pembayaran aman dan terenkripsi. Butuh bantuan?{' '}
              <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">
                Hubungi CS kami
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
