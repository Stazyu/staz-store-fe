"use client";

import React, { useState } from 'react';
import { FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onApply: (code: string) => Promise<boolean>; // return success status
    voucherStatus: {
        code: string;
        discount: number;
        isValid: boolean;
    } | null;
    onRemove: () => void;
    errorMessage?: string;
}


export default function PromoCodeInput({ value, onChange, onApply, voucherStatus, onRemove, errorMessage }: PromoCodeInputProps) {
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!value.trim()) return;
        setIsApplying(true);
        try {
            await onApply(value);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    4
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kode Promo</h3>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Punya Kode Promo?
                </label>
                <div className="flex space-x-2">
                    <div className="relative grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaTag className="h-4 w-4 text-gray-400 dark:text-gray-200" />
                        </div>
                        <input
                            type="text"
                            name="voucherCode"
                            value={value}
                            onChange={onChange}
                            disabled={!!voucherStatus}
                            className="block w-full pl-10 pr-3 py-2 uppercase placeholder:normal-case border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            placeholder="Masukkan kode promo"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={voucherStatus ? onRemove : handleApply}
                        disabled={(!value.trim() && !voucherStatus) || isApplying}
                        className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${voucherStatus
                            ? 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isApplying ? 'Memproses...' : voucherStatus ? 'Hapus' : 'Gunakan'}
                    </button>
                </div>
                {voucherStatus && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
                        <div className="shrink-0 text-green-500 mt-0.5 mr-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                Promo Berhasil Digunakan!
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400">
                                Anda hemat Rp {voucherStatus.discount.toLocaleString('id-ID')}
                            </p>
                        </div>

                    </div>
                )}
            </div>
            {errorMessage && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
