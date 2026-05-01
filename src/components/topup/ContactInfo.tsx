"use client";

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface ContactInfoProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContactInfo({ value, onChange }: ContactInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    3
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Kontak</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Nomor WhatsApp
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaWhatsapp className="h-5 w-5 text-green-500" />
                            <span className="ml-2 text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2">+62</span>
                        </div>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={value}
                            onChange={onChange}
                            className="block w-full pl-20 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                            placeholder="81234567890"
                            required
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Bukti transaksi akan dikirimkan ke nomor WhatsApp ini.
                    </p>
                </div>
            </div>
        </div>
    );
}
