'use client';

import Image from 'next/image';
import Link from 'next/link';

const PromoBanner = () => {
  return (
    <div className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
      <div className="absolute inset-0 flex items-center px-8 md:px-16">
        <div className="max-w-2xl text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Diskon Hingga 70%</h2>
          <p className="text-lg md:text-xl mb-6">Raih kesempatan terbatas untuk mendapatkan diskon besar-besaran di semua produk game favoritmu!</p>
          <Link
            href="/games"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Lihat Semua Game
          </Link>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 w-1/2 h-full">
        <Image
          src="/images/promo-banner.png"
          alt="Promo Banner"
          fill
          className="object-contain object-right"
          priority
        />
      </div>
    </div>
  );
};

export default PromoBanner;
