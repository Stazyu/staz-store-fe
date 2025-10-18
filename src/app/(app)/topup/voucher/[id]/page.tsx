'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
// TopUpCard component not used in this file
import PurchaseForm from '@/components/forms/PurchaseForm';
import OrderProcessingModal from '@/components/forms/OrderProcessingModal';
import { voucherList } from '@/data/games';
import { TopUpCardProps } from '@/types/topUpCard';

interface Voucher {
    id: string;
    title: string;
    image: string;
    category: string[];
    type: string;
    isPopular: boolean;
    description: string;
    topUpOptions: Array<{
        amount: number;
        price: number;
        bonus: number;
    }>;
}

export default function VoucherTopUpPage({ params }: { params: Promise<{ id: string }> }) {
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<TopUpCardProps['option']>({
        id: 0,
        amount: 0,
        price: 0,
    });
    const [showPurchaseForm, setShowPurchaseForm] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderData, setOrderData] = useState<{
        orderId: string;
        playerId: string;
        paymentMethod: string;
        amount: number;
        currency: string;
        [key: string]: string | number;
    } | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const loadVoucher = async () => {
            try {
                const { id } = await params;
                const voucherData = voucherList.find(v => v.id === id);
                if (!voucherData) {
                    notFound();
                }
                setVoucher(voucherData);
            } catch (error) {
                console.error('Error loading voucher:', error);
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        loadVoucher();
    }, [params]);

    const handleTopUp = (option: Voucher['topUpOptions'][number]) => {
        setSelectedOption({
            id: 0,
            amount: option.amount,
            price: option.price,
        });
        setShowPurchaseForm(true);
    };

    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
        setShowPurchaseForm(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!voucher) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {showPurchaseForm && (
                <PurchaseForm
                    selectedOption={selectedOption}
                    currency="amount"
                    gameTitle={voucher.title}
                    isAuthenticated={session?.user !== null}
                    onClose={() => setShowPurchaseForm(false)}
                    onSubmit={(data) => {
                        setOrderData({
                            ...data,
                            amount: selectedOption.amount || 0, // Using diamonds field as amount
                            currency: 'IDR'
                        });
                        setShowPurchaseForm(false);
                        setShowOrderModal(true);
                    }}
                />
            )}

            {showOrderModal && orderData && (
                <OrderProcessingModal
                    orderId={orderData.orderId}
                    gameId={orderData.playerId}
                    gameTitle={voucher.title}
                    amount={orderData.amount}
                    currency="IDR"
                    price={orderData.price as number}
                    paymentType={orderData.paymentMethod}
                    onClose={handleCloseOrderModal}
                    status="failed"
                />
            )}

            <nav className="mb-6">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                    <FaArrowLeft className="mr-2" />
                    Kembali ke Beranda
                </Link>
            </nav>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-1/3 xl:w-1/4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sticky top-6">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-24 h-24 relative mb-4">
                                <Image
                                    src={voucher.image}
                                    alt={voucher.title}
                                    fill
                                    className="object-contain rounded-lg"
                                    sizes="96px"
                                />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">{voucher.title}</h1>
                            <div className="flex gap-2">
                                {voucher.category.map((category, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full mt-2">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Voucher Details */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detail Voucher</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">{voucher.description}</p>

                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <FaShieldAlt className="mr-2 text-green-500" />
                                <span>Garansi 100% aman dan terpercaya</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:w-2/3 xl:w-3/4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pilih Nominal Voucher</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {voucher.topUpOptions.map((option, index) => {
                                const isPopular = index === 1; // Mark second option as popular
                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleTopUp(option)}
                                        className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md ${selectedOption.diamonds === option.amount
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {isPopular && (
                                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                                POPULER
                                            </span>
                                        )}
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(option.amount)}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                            }).format(option.price)}
                                        </div>
                                        {option.bonus > 0 && (
                                            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                +{option.bonus}% bonus
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cara Menggunakan Voucher</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>Pilih nominal voucher yang diinginkan</li>
                                <li>Isi data yang diminta</li>
                                <li>Lakukan pembayaran</li>
                                <li>Voucher akan dikirim ke email/WhatsApp Anda</li>
                                <li>Gunakan kode voucher di platform yang sesuai</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}