"use client";

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import TopUpCard from '@/components/TopUpCard';
import PurchaseForm from '@/components/forms/PurchaseForm';
import OrderProcessingModal from '@/components/forms/OrderProcessingModal';
import { getGameById } from '@/data/games';
import { Game } from '@/types/product';
import { TopUpCardProps } from '@/types/topUpCard';

export default function GameTopUpPage({ params }: { params: Promise<{ id: string }> }) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<TopUpCardProps['option']>({
    id: 0,
    diamonds: 0,
    uc: 0,
    crystals: 0,
    points: 0,
    lunites: 0,
    price: 0,
    bonus: 0,
  });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderData, setOrderData] = useState<any>(null);
  const { data: session } = useSession();
  const [currency, setCurrency] = useState<'diamonds' | 'uc' | 'crystals' | 'points' | 'lunites'>('diamonds');

  useEffect(() => {
    const loadGame = async () => {
      try {
        const gameData = getGameById((await params).id);
        if (!gameData) {
          notFound();
        }
        setGame(gameData);

        // Determine the currency type based on the first option
        const currencyKey = Object.keys(gameData.topUpOptions[0])
          .find(key => ['diamonds', 'uc', 'crystals', 'points', 'lunites'].includes(key)) as
          'diamonds' | 'uc' | 'crystals' | 'points' | 'lunites';
        setCurrency(currencyKey);
      } catch (error) {
        console.error('Error loading game:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [params]);

  const handleTopUp = (option: Game['topUpOptions'][number]) => {
    setSelectedOption(option);
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

  if (!game) {
    notFound();
  }

  // Rest of your component JSX remains the same
  return (
    <div className="min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {showPurchaseForm && (
        <PurchaseForm
          selectedOption={selectedOption}
          currency={currency}
          gameTitle={game.title}
          isAuthenticated={session?.user !== null}
          onClose={() => setShowPurchaseForm(false)}
          onSubmit={(data) => {
            setOrderData(data);
            setShowPurchaseForm(false);
            setShowOrderModal(true);
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
        // status="payment-required"
        />
      )}

      {/* Rest of your JSX */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <FaArrowLeft className="mr-2" />
          Kembali ke Beranda
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 sticky top-6 border border-white/20 backdrop-blur-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
                <div className="w-28 h-28 relative">
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    className="object-cover rounded-2xl shadow-lg"
                    sizes="112px"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent text-center mb-2">{game.title}</h1>
              <div className="flex gap-2 flex-wrap justify-center">
                {game.category.map((category, index) => (
                  <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-md">
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Game Details */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center text-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
                Detail Game
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{game.description}</p>

              <div className="space-y-4">
                <div className="flex items-center text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs font-bold">🌐</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Server</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Indonesia</span>
                  </div>
                </div>
                <div className="flex items-center text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs font-bold">💎</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Tipe</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Top Up {currency}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs font-bold">📱</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Platform</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Mobile/PC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Info */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-2"></div>
                Estimasi Proses
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">Instan</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">Proses 1-5 menit setelah pembayaran</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">💰</span>
                  </div>
                  <div>
                    <p className="font-bold text-yellow-700 dark:text-yellow-400">Harga Termurah</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">Harga bersaing di pasaran</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">🛡️</span>
                  </div>
                  <div>
                    <p className="font-bold text-blue-700 dark:text-blue-400">Garansi 100%</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">Uang kembali jika terjadi kendala</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3 xl:w-3/4">
          <div className="bg-gradient-to-br from-white via-purple-50 to-pink-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 mb-8 border border-white/20 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Pilih Nominal {game.title}</h1>
                <p className="text-gray-600 dark:text-gray-300">Pilih jumlah {currency} yang ingin kamu beli</p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaShieldAlt className="text-white text-lg" />
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">Pembayaran Aman</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">& Terpercaya</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {game.topUpOptions.map((option: Game['topUpOptions'][number]) => (
                <TopUpCard
                  key={option.id}
                  option={option}
                  currency={currency}
                  onSelect={handleTopUp}
                />
              ))}
            </div>
          </div>

          {/* How to Top Up */}
          <div className="bg-gradient-to-br from-white via-indigo-50 to-blue-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6 text-center">Cara Top Up {game.title}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">1</div>
                  <h3 className="font-bold text-lg text-center mb-2">Pilih Nominal</h3>
                  <p className="text-sm text-center text-blue-100">Pilih jumlah {currency} yang ingin kamu beli dengan harga terbaik</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">2</div>
                  <h3 className="font-bold text-lg text-center mb-2">Masukkan ID Game</h3>
                  <p className="text-sm text-center text-purple-100">Masukkan ID game dan server kamu dengan benar</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-red-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">3</div>
                  <h3 className="font-bold text-lg text-center mb-2">Pembayaran</h3>
                  <p className="text-sm text-center text-pink-100">Selesaikan pembayaran dengan metode pilihanmu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}