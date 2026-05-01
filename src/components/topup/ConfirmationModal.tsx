"use client";

import React from 'react';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    data: {
        gameTitle: string;
        nickname: string;
        playerId: string;
        server?: string;
        serverId?: string;
        item: string;
        price: number;
        paymentMethod: string;
    };
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, isProcessing, data }: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 p-6">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Pesanan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Mohon periksa kembali detail pesanan Anda
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-3 gap-y-3 text-sm">
                        <div className="text-gray-500 dark:text-gray-400">Username</div>
                        <div className="col-span-2 font-semibold text-gray-900 dark:text-white text-right break-words">{data.nickname}</div>

                        <div className="text-gray-500 dark:text-gray-400">ID Player</div>
                        <div className="col-span-2 font-semibold text-gray-900 dark:text-white text-right">{data.playerId} {data.serverId ? `(${data.serverId})` : ''}</div>

                        {data.server && (
                            <>
                                <div className="text-gray-500 dark:text-gray-400">Server</div>
                                <div className="col-span-2 font-semibold text-gray-900 dark:text-white text-right">{data.server}</div>
                            </>
                        )}

                        <div className="text-gray-500 dark:text-gray-400">Item</div>
                        <div className="col-span-2 font-semibold text-gray-900 dark:text-white text-right">{data.gameTitle} - {data.item}</div>

                        <div className="text-gray-500 dark:text-gray-400">Metode Bayar</div>
                        <div className="col-span-2 font-semibold text-gray-900 dark:text-white text-right uppercase">{data.paymentMethod}</div>

                        <div className="border-t border-gray-100 dark:border-gray-700 col-span-3 my-1"></div>

                        <div className="text-gray-900 dark:text-white font-bold">Total Bayar</div>
                        <div className="col-span-2 font-bold text-blue-600 dark:text-blue-400 text-lg text-right">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.price)}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Memproses...
                            </>
                        ) : (
                            'Beli Sekarang'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
