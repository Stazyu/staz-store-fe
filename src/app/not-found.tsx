"use client";

import Link from 'next/link';
import { FaArrowLeft, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur opacity-20"></div>
          <div className="relative">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
              404
            </h1>
          </div>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FaHome className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
            </span>
            Kembali ke Beranda
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FaArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
            </span>
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Butuh bantuan?{' '}
            <Link href="/kontak" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Hubungi Dukungan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
