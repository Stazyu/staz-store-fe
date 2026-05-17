"use client";

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import authClient from '@/lib/auth-client';
import TopUpCard from '@/components/topup/TopUpCard';
import OrderProcessingModal from '@/components/forms/OrderProcessingModal';
import ConfirmationModal from '@/components/topup/ConfirmationModal';
import { getGameById, voucherList } from '@/data/games';
import { Game } from '@/types/game.types';
import { TopUpCardProps } from '@/types/topUpCard.types';
import { PAYMENT_METHOD_CATEGORIES, PAYMENT_METHODS } from '@/constants/paymentMethods';
import { DUMMY_PROMO_CODES } from '@/data/promoCodes';
import toast from 'react-hot-toast';

// New Components
import UserIdInput from '@/components/topup/UserIdInput';
import PaymentMethodSelection from '@/components/topup/PaymentMethodSelection';
import ContactInfo from '@/components/topup/ContactInfo';
import PromoCodeInput from '@/components/topup/PromoCodeInput';
import { useProfile } from '@/hooks/useProfile';

// Type definitions to unify Game and Voucher
interface ProductData {
    id: string;
    title: string;
    image: string;
    category: string[];
    type: string;
    isPopular: boolean;
    description: string;
    topUpOptions: Array<{
        id?: string;
        amount: number;
        price: number;
        bonus: number;
        diamonds?: number;
        uc?: number;
        crystals?: number;
        points?: number;
        lunites?: number;
    }>;
}

export default function TopUpPage() {
    const params = useParams();
    // slug[0] will be 'game' or 'voucher'
    // slug[1] will be the ID
    const slug = params?.slug as string[];
    const type = slug?.[0];
    const id = slug?.[1];

    const [product, setProduct] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<any | null>(null);
    const [currency, setCurrency] = useState<'diamonds' | 'uc' | 'crystals' | 'points' | 'lunites' | 'IDR'>('IDR');

    // Form State
    const [formData, setFormData] = useState({
        playerId: '',
        nickname: '',
        server: '',
        serverId: '',
        phoneNumber: '',
        paymentMethod: '',
        voucherCode: '',
    });

    const [promo, setPromo] = useState<{
        code: string;
        discount: number;
        isValid: boolean;
        description?: string;
    } | null>(null);
    const [promoError, setPromoError] = useState<string>('');

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session } = authClient.useSession();
    const { data: userProfile } = useProfile();

    const [availablePaymentMethods, setAvailablePaymentMethods] = useState(PAYMENT_METHOD_CATEGORIES);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                if (!type || !id) {
                    // maybe redirect? but for now let's notFound
                    return;
                }

                let data: ProductData | undefined;

                if (type === 'game') {
                    const gameData = getGameById(id);
                    if (gameData) {
                        data = gameData as unknown as ProductData;
                        // Determine currency for games
                        const currencyKey = Object.keys(gameData.topUpOptions[0])
                            .find(key => ['diamonds', 'uc', 'crystals', 'points', 'lunites'].includes(key)) as
                            'diamonds' | 'uc' | 'crystals' | 'points' | 'lunites';
                        setCurrency(currencyKey || 'IDR');
                    }
                } else if (type === 'voucher') {
                    const voucherData = voucherList.find(v => v.id === id);
                    if (voucherData) {
                        data = voucherData as unknown as ProductData;
                        setCurrency('IDR');
                    }
                }

                if (!data) {
                    notFound();
                }
                setProduct(data);

            } catch (error) {
                console.error('Error loading product:', error);
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) loadProduct();
    }, [slug, type, id]);

    useEffect(() => {
        const isAuthenticated = session?.user !== undefined;
        const filteredCategories = PAYMENT_METHOD_CATEGORIES.map(category => ({
            ...category,
            methods: category.methods.filter(method =>
                method.id !== 'balance' || isAuthenticated
            )
        })).filter(category => category.methods.length > 0);

        setAvailablePaymentMethods(filteredCategories);
    }, [session]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'voucherCode') {
            setPromoError('');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyPromo = async (code: string) => {
        if (!selectedOption) {
            toast.error('Pilih item terlebih dahulu sebelum menggunakan kode promo');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const validPromo = DUMMY_PROMO_CODES.find(p => p.code === code.toUpperCase());

        if (validPromo) {
            if (selectedOption.price < validPromo.minSpend) {
                setPromoError(`Minimal pembelian Rp ${validPromo.minSpend.toLocaleString('id-ID')} untuk menggunakan kode ini`);
                return false;
            }

            let discount = 0;
            if (validPromo.type === 'fixed') {
                discount = validPromo.discountAmount;
            } else if (validPromo.type === 'percentage') {
                discount = selectedOption.price * validPromo.discountAmount;
                if (validPromo.code === 'SULTAN' && discount > 50000) discount = 50000;
            }

            setPromo({ code: validPromo.code, discount, isValid: true, description: validPromo.description });
            toast.success(`Kode promo "${validPromo.code}" berhasil digunakan!`);
            return true;
        } else {
            setPromoError('Kode promo tidak ditemukan');
            return false;
        }
    };

    const calculateFinalPrice = () => {
        if (!selectedOption) return 0;

        let price = selectedOption.price;
        const method = PAYMENT_METHODS.find(m => m.id === formData.paymentMethod);

        if (method) {
            if (method.feeType === 'percentage') {
                price += price * method.fee;
            } else {
                price += method.fee;
            }
        }

        if (promo) {
            price -= promo.discount;
        }

        return Math.max(0, price);
    };

    const handleBuyNowTrigger = async () => {
        if (!selectedOption) {
            toast.error('Pilih nominal top up terlebih dahulu');
            return;
        }
        if (!formData.playerId) {
            toast.error('ID Pemain harus diisi');
            return;
        }

        const isMobileLegends = product?.title.toLowerCase().includes('mobile legends');
        if (isMobileLegends && !formData.serverId) {
            toast.error('ID Server harus diisi');
            return;
        }

        if (!formData.paymentMethod) {
            toast.error('Pilih metode pembayaran');
            return;
        }
        if (!formData.phoneNumber) {
            toast.error('Nomor WhatsApp harus diisi');
            return;
        }

        setIsSubmitting(true);

        let nicknameToUse = formData.nickname;
        if (!nicknameToUse) {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                nicknameToUse = `StazPlayer_${Math.floor(Math.random() * 1000)}`;
                setFormData(prev => ({ ...prev, nickname: nicknameToUse }));
            } catch (error) {
                console.error(error);
                toast.error('Gagal verifikasi ID');
                setIsSubmitting(false);
                return;
            }
        }

        setIsSubmitting(false);
        setShowConfirmation(true);
    }

    const handleConfirmPurchase = () => {
        setIsSubmitting(true);
        const finalPrice = calculateFinalPrice();
        const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const data = {
            orderId,
            playerId: formData.playerId,
            game: product?.title,
            amount: currency !== 'IDR' ? selectedOption?.[currency] : selectedOption?.amount,
            currency,
            price: finalPrice,
            paymentMethod: formData.paymentMethod,
        };

        setOrderData(data);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowConfirmation(false);
            setShowOrderModal(true);
        }, 1000);
    };

    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
            {/* Confirmation Modal */}
            {showConfirmation && (
                <ConfirmationModal
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleConfirmPurchase}
                    isProcessing={isSubmitting}
                    data={{
                        gameTitle: product.title,
                        nickname: formData.nickname || 'Checking...',
                        playerId: formData.playerId,
                        server: formData.server,
                        serverId: formData.serverId,
                        item: `${currency !== 'IDR' ? (selectedOption?.[currency] ?? 0) : selectedOption?.amount} ${currency}`,
                        price: calculateFinalPrice(),
                        paymentMethod: PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.name || formData.paymentMethod
                    }}
                />
            )}

            {showOrderModal && orderData && (
                <OrderProcessingModal
                    orderId={orderData.orderId}
                    gameId={orderData.playerId}
                    gameTitle={orderData.game}
                    amount={orderData.amount}
                    currency={orderData.currency}
                    price={orderData.price}
                    paymentType={orderData.paymentMethod}
                    onClose={handleCloseOrderModal}
                    status={orderData.paymentMethod === "balance" ? "pending" : "payment-required"}
                />
            )}

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <nav className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                        <FaArrowLeft className="mr-2" />
                        Kembali ke Beranda
                    </Link>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar (Product Info) */}
                    <div className="lg:w-1/3 xl:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-32 h-32 relative mb-4 rounded-xl overflow-hidden shadow-md">
                                    {/* Handle image display style difference if any between voucher/game - kept consistent here */}
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className={type === 'voucher' ? "object-contain" : "object-cover"}
                                        sizes="128px"
                                    />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{product.title}</h1>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {product.category.map((category, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold rounded-full">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deskripsi</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                    {product.description}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                                    <FaShieldAlt className="text-lg" />
                                    <span className="font-medium">Jaminan 100% Aman</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content (Form) */}
                    <div className="lg:w-2/3 xl:w-3/4">
                        {/* 1. Item Selection */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    1
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pilih Nominal</h3>
                            </div>

                            {type === 'game' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {product.topUpOptions.map((option: any) => (
                                        <div key={option.id} className="relative">
                                            <TopUpCard
                                                option={option}
                                                currency={currency as any}
                                                onSelect={(opt) => setSelectedOption(opt)}
                                            />
                                            {selectedOption?.id === option.id && (
                                                <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none z-10 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.topUpOptions.map((option, index) => {
                                        const isSelected = selectedOption?.amount === option.amount;
                                        const isPopular = index === 1; // logical heuristic from original code

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedOption(option)}
                                                className={`relative border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                            >
                                                {isPopular && (
                                                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                        POPULER
                                                    </span>
                                                )}
                                                <div className="font-medium text-gray-900 dark:text-white text-lg">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(option.amount)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(option.price)}
                                                </div>
                                                {option.bonus > 0 && (
                                                    <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs rounded">
                                                        +{option.bonus}% bonus
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. User ID */}
                        <div className="relative">
                            {/* Hiding the number blob since components often handle their own headers now or are composable */}
                            <div className="absolute -left-3 top-[-10px] bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">2</div>
                            <UserIdInput
                                gameTitle={product.title}
                                value={{
                                    playerId: formData.playerId,
                                    server: formData.server,
                                    serverId: formData.serverId
                                }}
                                onChange={handleChange}
                                onVerify={(data) => {
                                    if (data.isValid && data.nickname) {
                                        setFormData(prev => ({ ...prev, nickname: data.nickname || '' }));
                                    } else if (!data.isValid) {
                                        setFormData(prev => ({ ...prev, nickname: '' }));
                                    }
                                }}
                            />
                        </div>

                        {/* 3. Payment Method */}
                        <PaymentMethodSelection
                            availableMethods={availablePaymentMethods}
                            selectedMethod={formData.paymentMethod}
                            onSelect={(id) => setFormData(prev => ({ ...prev, paymentMethod: id }))}
                            userBalance={userProfile?.balance || 0}
                        />

                        {/* 4. Contact Info */}
                        <ContactInfo
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />

                        {/* 5. Promo Code */}
                        <div className="relative">
                            <PromoCodeInput
                                value={formData.voucherCode}
                                onChange={handleChange}
                                onApply={handleApplyPromo}
                                voucherStatus={promo}
                                onRemove={() => {
                                    setPromo(null);
                                    setPromoError('');
                                    setFormData(prev => ({ ...prev, voucherCode: '' }));
                                }}
                                errorMessage={promoError}
                            />
                            <div className="mt-2 text-xs text-gray-400 px-1">
                                <span className="font-semibold">Kode Promo Tersedia (Demo):</span> STAZHEMAT, GAMINGSERU, NEWUSER, SULTAN
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(calculateFinalPrice())}
                            </span>
                            {promo && (
                                <span className="text-sm text-gray-400 line-through">
                                    {selectedOption ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedOption.price) : ''}
                                </span>
                            )}
                        </div>
                        {promo && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                Hemat: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(promo.discount)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleBuyNowTrigger}
                        disabled={isSubmitting || !selectedOption}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Memproses...' : 'Beli Sekarang'}
                    </button>
                </div>
            </div>

        </div>
    );
}
