'use client';

import React, { useState, useEffect } from 'react';
import { FaUser, FaServer, FaInfoCircle, FaCheck, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { PAYMENT_METHOD_CATEGORIES, PAYMENT_METHODS } from '@/constants/paymentMethods';

// Components
import PurchaseFooter from '@/components/purchase/PurchaseFooter';
// import PaymentAccording from '@/components/PaymentAccording';

// Types
import { PaymentMethod } from '@/types/paymentMethod';
import { TopUpCardProps } from '@/types/topUpCard';

interface PurchaseFormProps {
  selectedOption: TopUpCardProps['option'];
  currency: string;
  gameTitle: string;
  isAuthenticated: boolean;
  onClose: () => void;
  onSubmit: (data: {
    playerId: string;
    nickname: string;
    server?: string;
    serverId?: string;
    phoneNumber: string;
    paymentMethod: string;
    amount: number;
    price: number;
    currency: string;
    game: string;
    orderId: string;
  }) => void;
}

export default function PurchaseForm({ selectedOption, currency, gameTitle, isAuthenticated, onClose, onSubmit }: PurchaseFormProps) {
  const isMobileLegends = gameTitle.toLowerCase().includes('mobile legends');
  const showServerField = ['genshin', 'wuthering waves', 'honkai star rail', 'zenless zone zero'].some(
    game => gameTitle.toLowerCase().includes(game)
  ) || isMobileLegends;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // User's balance (in IDR)
  const [userBalance] = useState(50000); // Example balance, in a real app this would come from user context/API
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState(PAYMENT_METHOD_CATEGORIES);
  const [formData, setFormData] = useState({
    playerId: '',
    nickname: '',
    server: '',
    serverId: '',
    phoneNumber: '',
    paymentMethod: '',
    voucherCode: '',
  });

  const [voucher, setVoucher] = useState<{
    code: string;
    discount: number;
    isValid: boolean;
  } | null>(null);

  console.log('PurchaseForm selectedOption', selectedOption);

  // Check if mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile(); // run on mount
    window.addEventListener('resize', checkIsMobile); // handle resize

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Generate order ID
  useEffect(() => {
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(orderId);
  }, []);

  // Filter payment methods based on authentication status
  useEffect(() => {
    const filteredCategories = PAYMENT_METHOD_CATEGORIES.map(category => ({
      ...category,
      methods: category.methods.filter(method =>
        method.id !== 'balance' || isAuthenticated
      )
    })).filter(category => category.methods.length > 0);

    setAvailablePaymentMethods(filteredCategories);

    // Reset payment method if the current selection is no longer available
    if (formData.paymentMethod && !filteredCategories.some(
      category => category.methods.some(m => m.id === formData.paymentMethod)
    )) {
      setFormData(prev => ({
        ...prev,
        paymentMethod: ''
      }));
    }
  }, [isAuthenticated, formData.paymentMethod]);

  // Calculate final price based on selected payment method
  const calculateFinalPrice = (methodId: string): number => {
    const method = PAYMENT_METHODS.find((m: PaymentMethod) => m.id === methodId);
    return method && method.feeType === 'percentage' ? selectedOption.price * method.fee + selectedOption.price : method && method.feeType === 'fixed' ? selectedOption.price + method.fee : selectedOption.price;
  };

  const finalPrice = calculateFinalPrice(formData.paymentMethod);
  const hasSufficientBalance = userBalance >= finalPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('PurchaseForm handleChange', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    })
    );
  };

  const handleVerifyId = async () => {
    if (!formData.playerId.trim()) return;

    setIsVerifyingId(true);

    // Simulate API call to verify ID
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      // For demo purposes, we'll consider any non-empty ID as valid
      // In a real app, you would make an API call to verify the ID
      const isValid = (formData.playerId.trim().length > 3 && formData.serverId.trim().length > 0) || ['Asia', 'Europe', 'America', 'Middle East'].includes(formData.server) || true; // Simple validation
      setIsIdVerified(isValid);
      console.log('ID Player ' + formData.playerId);
      console.log(' ID Server ' + formData.serverId);
      console.log('Server ' + formData.server);

      if (!isValid) {
        toast.error('ID tidak valid. Pastikan ID sudah benar.');
      }
    } catch (error) {
      console.error('Error verifying ID:', error);
      setIsIdVerified(false);
      toast.error('Gagal memverifikasi ID. Silakan coba lagi.');
    } finally {
      setIsVerifyingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !isIdVerified || !formData.paymentMethod) return;

    // Check if selected payment is balance and if balance is sufficient
    if (formData.paymentMethod === 'balance' && !hasSufficientBalance) {
      toast.error('Saldo tidak mencukupi. Silakan pilih metode pembayaran lain.');
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = selectedOption[currency as keyof typeof selectedOption] ?? 0;
      console.log('PurchaseForm handleSubmit', finalPrice);

      onSubmit({
        ...formData,
        amount,
        price: finalPrice,
        currency,
        game: gameTitle,
        orderId,
      });

      console.log('PurchaseForm handleSubmit', formData);

    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedOption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Form Pembelian</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-800 p-4 rounded-lg mt-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-100">Detail Pembelian</h4>
                <p className="text-sm text-blue-700 dark:text-blue-100 mt-1">
                  {selectedOption[currency as keyof typeof selectedOption] ?? 0} {currency} - Rp {selectedOption.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-100 mt-1">{gameTitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">

          <form id="purchase-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  ID Pemain
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-gray-400 dark:text-gray-200" />
                    </div>
                    <input
                      type="tel"
                      name="playerId"
                      value={formData.playerId}
                      onChange={(e) => {
                        handleChange(e);
                        setIsIdVerified(false);
                      }}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan ID Pemain"
                      required
                      disabled={isVerifyingId}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyId}
                    disabled={!formData.playerId.trim() || (isMobileLegends && !formData.serverId.trim()) || isVerifyingId}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isIdVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-600'
                      } ${(!formData.playerId.trim() || (isMobileLegends && !formData.serverId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                {isIdVerified && (
                  <p className="mt-1 text-xs text-green-600">ID berhasil diverifikasi</p>
                )}
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
                      value={formData.serverId}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border text-gray-700 dark:text-gray-200 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan ID Server"
                      required
                      pattern="\d+"
                      title="Masukkan angka ID Server"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                    Dapat ditemukan di profil game Anda
                  </p>
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
                      value={formData.server}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border text-gray-700 dark:text-gray-200 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-200">+62</span>
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="81234567890"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nomor WhatsApp akan digunakan untuk mengirimkan invoice pembayaran
                </p>
              </div>

              {/* Voucher Code Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Kode Voucher (Opsional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="voucherCode"
                    value={formData.voucherCode}
                    onChange={handleChange}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-200"
                    placeholder="Masukkan kode voucher"
                    disabled={!!voucher}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (voucher) {
                        // Cancel voucher
                        setVoucher(null);
                        setFormData(prev => ({ ...prev, voucherCode: '' }));
                        toast.success('Voucher dibatalkan');
                      } else {
                        // Apply voucher
                        // In a real app, you would validate the voucher with an API call
                        const isValidVoucher = formData.voucherCode.length > 0; // Simple validation
                        if (isValidVoucher) {
                          setVoucher({
                            code: formData.voucherCode,
                            discount: 10000, // Example discount amount
                            isValid: true
                          });
                          toast.success('Voucher berhasil digunakan!');
                        } else {
                          setVoucher(null);
                          toast.error('Kode voucher tidak valid');
                        }
                      }
                    }}
                    disabled={!voucher && !formData.voucherCode.trim()}
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${voucher
                      ? 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-300'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-blue-200'
                      }`}
                  >
                    {voucher ? 'Batal' : 'Gunakan'}
                  </button>
                </div>
                {voucher && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Voucher {voucher.code} berhasil digunakan! Diskon Rp {voucher.discount.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-white">Metode Pembayaran</h3>
                  {formData.paymentMethod === 'balance' && (
                    <span className="text-xs text-gray-500 dark:text-white">
                      Saldo tersedia: Rp {userBalance.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                {/* <PaymentAccording
                  groupedMethods={PAYMENT_METHOD_CATEGORIES}
                  formData={formData}
                  handleChange={handleChange}
                  hasSufficientBalance={hasSufficientBalance}
                /> */}
                {/* Payment Method */}
                <div className="space-y-3">
                  {availablePaymentMethods.map((category) => (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                      </div>
                      <div className="p-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-2">
                          {category.methods.map((method) => {
                            const isBalanceMethod = method.id === 'balance';
                            const isDisabled = isBalanceMethod && !hasSufficientBalance;

                            return (
                              <label
                                key={method.id}
                                className={`flex items-center p-3 border rounded-lg ${formData.paymentMethod === method.id
                                  ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/20 cursor-pointer'
                                  : isDisabled
                                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700 cursor-not-allowed'
                                    : 'border-gray-300 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500 cursor-pointer'
                                  } ${isDisabled ? 'opacity-60' : ''}`}
                                title={isDisabled ? 'Saldo tidak mencukupi' : ''}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={method.id}
                                  checked={formData.paymentMethod === method.id}
                                  onChange={handleChange}
                                  disabled={isDisabled}
                                  className={`h-4 w-4 ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 focus:ring-blue-500'
                                    } border-gray-300 dark:border-gray-700`}
                                />
                                <div className="ml-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 flex-shrink-0">
                                      <div className="relative w-10 h-10">
                                        <Image
                                          src={method.image!}
                                          alt={method.name}
                                          fill
                                          sizes="86px"
                                          className={`object-contain ${method.category === 'qris' ? 'dark:invert' : ''}`}
                                          onError={(e) => {
                                            // Fallback to icon if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = `data:image/svg+xml,${encodeURIComponent(
                                              `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><text y='20'>${method.icon}</text></svg>`
                                            )}`;
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-sm dark:text-gray-300">
                                      {method.name}
                                      {isBalanceMethod && !hasSufficientBalance && (
                                        <span className="ml-1 text-xs text-red-500">(Tidak cukup)</span>
                                      )}
                                    </span>
                                  </div>
                                  {method.fee > 0 ? (
                                    <div className="text-xs text-red-600 dark:text-red-400">
                                      +Rp {(method.feeType === 'percentage' ? (method.fee * 100).toFixed(1) + '%' : method.fee)} admin
                                    </div>
                                  ) : isBalanceMethod ? (
                                    <div className="text-xs text-green-500 dark:text-green-400">
                                      Tanpa biaya admin
                                    </div>
                                  ) : null}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
              <div className="pt-4">
                {/* Price summary removed from here as it's now in the footer */}
              </div>
            </div>
          </form>
          {isMobile && (
            <PurchaseFooter
              isMobile={isMobile}
              selectedOption={selectedOption}
              formData={formData}
              finalPrice={finalPrice}
              isSubmitting={isSubmitting}
              isIdVerified={isIdVerified}
              PAYMENT_METHODS={PAYMENT_METHOD_CATEGORIES}
            />
          )}
        </div>

        {/* Footer */}
        {isMobile ? null : (
          <PurchaseFooter
            isMobile={isMobile}
            selectedOption={selectedOption}
            formData={formData}
            finalPrice={finalPrice}
            isSubmitting={isSubmitting}
            isIdVerified={isIdVerified}
            PAYMENT_METHODS={PAYMENT_METHOD_CATEGORIES}
          />
          // <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          //   <div className="bg-gray-50 p-3 rounded-lg mb-3 dark:bg-gray-700">
          //     <div className="flex justify-between text-sm mb-1">
          //       <span className="text-gray-600 dark:text-gray-300">Harga Awal:</span>
          //       <span className="text-gray-600 dark:text-gray-300">Rp {selectedOption.price.toLocaleString('id-ID')}</span>
          //     </div>
          //     {formData.paymentMethod && (PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.fee || 0) > 0 && (
          //       <div className="flex justify-between text-sm mb-1">
          //         <span className="text-gray-600 dark:text-gray-300">Biaya Admin:</span>
          //         <span className="text-red-500 dark:text-red-400">+Rp {(PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.fee || 0).toLocaleString('id-ID')}</span>
          //       </div>
          //     )}
          //     <div className="flex justify-between font-medium pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
          //       <span className="text-gray-600 dark:text-gray-300">Total:</span>
          //       <span className="text-blue-600 dark:text-blue-200 text-lg font-bold">
          //         Rp {finalPrice.toLocaleString('id-ID')}
          //       </span>
          //     </div>
          //   </div>
          //   <button
          //     type="submit"
          //     form="purchase-form"
          //     disabled={isSubmitting || !isIdVerified || !formData.paymentMethod}
          //     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          //   >
          //     {isSubmitting ? 'Memproses...' : 'Beli Sekarang'}
          //   </button>
          //   <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          //     Dengan menekan tombol ini, Anda menyetujui Syarat & Ketentuan yang berlaku
          //   </p>
          // </div>
        )
        }
      </div>
    </div>
  );
}
