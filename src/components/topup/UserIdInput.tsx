"use client";

import React, { useState } from 'react';
import { FaUser, FaServer, FaCheck, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface UserIdInputProps {
    gameTitle: string;
    value: {
        playerId: string;
        server: string;
        serverId: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onVerify?: (data: { isValid: boolean; nickname?: string }) => void;
}

export default function UserIdInput({ gameTitle, value, onChange, onVerify }: UserIdInputProps) {
    const [isVerifyingId, setIsVerifyingId] = useState(false);
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [verifiedNickname, setVerifiedNickname] = useState('');

    const isMobileLegends = gameTitle.toLowerCase().includes('mobile legends');
    const showServerField = ['genshin', 'wuthering waves', 'honkai star rail', 'zenless zone zero'].some(
        game => gameTitle.toLowerCase().includes(game)
    ) || isMobileLegends;

    const handleVerifyId = async () => {
        if (!value.playerId.trim()) return;

        setIsVerifyingId(true);
        setVerifiedNickname('');

        // Simulate API call to verify ID
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            // For demo purposes, we'll consider any non-empty ID as valid
            const isValid = (value.playerId.trim().length > 3 && value.serverId.trim().length > 0) || ['Asia', 'Europe', 'America', 'Middle East'].includes(value.server) || true; // Simple validation

            const mockNickname = isValid ? `StazPlayer_${Math.floor(Math.random() * 1000)}` : '';

            setIsIdVerified(isValid);
            setVerifiedNickname(mockNickname);

            if (onVerify) onVerify({ isValid, nickname: mockNickname });

            if (isValid) {
                toast.success(`ID Terverifikasi: ${mockNickname}`);
            } else {
                toast.error('ID tidak valid. Pastikan ID sudah benar.');
            }
        } catch (error) {
            console.error('Error verifying ID:', error);
            setIsIdVerified(false);
            if (onVerify) onVerify({ isValid: false });
            toast.error('Gagal memverifikasi ID. Silakan coba lagi.');
        } finally {
            setIsVerifyingId(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    2
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Masukkan ID Game</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        ID Pemain
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-4 w-4 text-gray-400 dark:text-gray-200" />
                            </div>
                            <input
                                type="tel"
                                name="playerId"
                                value={value.playerId}
                                onChange={(e) => {
                                    onChange(e);
                                    setIsIdVerified(false);
                                    setVerifiedNickname('');
                                }}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Masukkan ID Pemain"
                                required
                                disabled={isVerifyingId}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleVerifyId}
                            disabled={!value.playerId.trim() || (isMobileLegends && !value.serverId.trim()) || isVerifyingId}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isIdVerified
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-600'
                                } ${(!value.playerId.trim() || (isMobileLegends && !value.serverId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isVerifyingId ? (
                                <FaSpinner className="animate-spin h-4 w-4" />
                            ) : isIdVerified ? (
                                <FaCheck className="h-4 w-4" />
                            ) : (
                                'Cek ID'
                            )}
                        </button>
                    </div>
                </div>

                {isMobileLegends ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                            ID Server (contoh: 1234)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaServer className="h-4 w-4 text-gray-400 dark:text-gray-200" />
                            </div>
                            <input
                                type="number"
                                name="serverId"
                                value={value.serverId}
                                onChange={onChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Masukkan ID Server"
                                required
                                pattern="\d+"
                                title="Masukkan angka ID Server"
                            />
                        </div>
                    </div>
                ) : showServerField ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                            Server
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaServer className="h-4 w-4 text-gray-400 dark:text-gray-200" />
                            </div>
                            <select
                                name="server"
                                value={value.server}
                                onChange={onChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                                required
                            >
                                <option value="">Pilih Server</option>
                                <option value="Asia">Asia</option>
                                <option value="Europe">Europe</option>
                                <option value="America">America</option>
                                <option value="Middle East">Middle East</option>
                            </select>
                        </div>
                    </div>
                ) : null}
            </div>

            {(isIdVerified && verifiedNickname) && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center border border-green-200 dark:border-green-800">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3 shrink-0 text-green-600 dark:text-green-300">
                        <FaUser size={14} />
                    </div>
                    <div>
                        <p className="text-xs text-green-600 dark:text-green-400">Username</p>
                        <p className="font-bold text-green-700 dark:text-green-300">{verifiedNickname}</p>
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                * Pastikan ID yang anda masukkan sudah benar. Kami tidak bertanggung jawab atas kesalahan penulisan ID.
            </div>
        </div>
    );
}
