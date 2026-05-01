"use client";

import React from 'react';
import Image from 'next/image';
import { PaymentMethod, PaymentMethodCategory } from '@/types/paymentMethod';

interface PaymentMethodSelectionProps {
    availableMethods: PaymentMethodCategory[];
    selectedMethod: string;
    onSelect: (methodId: string) => void;
    userBalance?: number;
}

export default function PaymentMethodSelection({ availableMethods, selectedMethod, onSelect, userBalance = 0 }: PaymentMethodSelectionProps) {

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        2
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pilih Pembayaran</h3>
                </div>
            </div>

            <div className="space-y-4">
                {availableMethods.map((category) => (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">{category.name}</h4>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {category.methods.map((method) => {
                                    const isBalanceMethod = method.id === 'balance';
                                    // Assuming hasSufficientBalance logic is handled outside or passed in. 
                                    // For now, let's assume if it is balance, we check userBalance, but effectively we probably want to disable if not enough.
                                    // But the component doesn't know the PRICE here to check sufficiency.
                                    // Let's just render. The parent can handle validation or we pass `price` prop if we want disabling visual.
                                    // For simplicity, I'll keep it simple for now, maybe add `selectedOptionPrice` later if needed.

                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => onSelect(method.id)}
                                            className={`relative flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedMethod === method.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                                }`}
                                        >
                                            <div className="shrink-0 w-12 h-8 relative mr-3">
                                                <Image
                                                    src={method.image!}
                                                    alt={method.name}
                                                    fill
                                                    sizes="48px"
                                                    className={`object-contain ${method.category === 'qris' ? 'dark:invert' : ''}`}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = `data:image/svg+xml,${encodeURIComponent(
                                                            `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><text y='20'>${method.icon}</text></svg>`
                                                        )}`;
                                                    }}
                                                />
                                            </div>
                                            <div className="grow min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {method.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {method.fee > 0 ? (
                                                        method.feeType === 'percentage'
                                                            ? `Biaya ${(method.fee * 100).toFixed(1)}%`
                                                            : `Biaya +Rp ${method.fee}`
                                                    ) : (
                                                        'Bebas Biaya'
                                                    )}
                                                </div>
                                                {isBalanceMethod && (
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                                        Saldo: Rp {userBalance.toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedMethod === method.id && (
                                                <div className="absolute top-2 right-2 text-blue-500">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
