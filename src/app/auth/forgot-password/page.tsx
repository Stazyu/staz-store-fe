'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiAlertCircle, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import authClient from '@/lib/auth-client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email diperlukan');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email tidak valid');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                setError(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError('Terjadi kesalahan tidak terduga.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-fit flex items-start justify-start rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Lupa Kata Sandi?</h1>
                        <p className="text-indigo-100 mt-1">Masukkan email Anda untuk reset kata sandi</p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="text-center animate-fade-in">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                                    <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Cek Email Anda</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-8">
                                    Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <strong>{email}</strong>.
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            setSuccess(false);
                                            setEmail('');
                                        }}
                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                                    >
                                        Kirim ulang email
                                    </button>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <Link
                                            href="/auth/login"
                                            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            Kembali ke Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Jangan khawatir! Cukup masukkan email Anda di bawah ini dan kami akan mengirimkan instruksi selanjutnya.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-600 dark:text-red-300 text-sm flex items-start animate-fade-in">
                                        <FiAlertCircle className="shrink-0 mt-0.5 mr-2" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Alamat Email
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="email@contoh.com"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError(null);
                                                }}
                                                className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100`}
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengirim...
                                            </span>
                                        ) : 'Kirim Link Reset'}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        <FiArrowLeft className="mr-1.5" />
                                        Kembali ke halaman login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
