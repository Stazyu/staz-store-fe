'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';

const promos = [
  {
    id: 1,
    title: 'Promo Spesial Hari Ini',
    description: 'Dapatkan diskon hingga 50% untuk semua game!',
    image: '/images/promo1.jpg',
    buttonText: 'Beli Sekarang',
    buttonLink: '/topup'
  },
  {
    id: 2,
    title: 'Top Up Genshin Impact',
    description: 'Dapatkan Genesis Crystal tambahan 20%',
    image: '/images/promo2.jpg',
    buttonText: 'Lihat Detail',
    buttonLink: '/topup/game/genshin-impact'
  },
  {
    id: 3,
    title: 'New Game Release',
    description: 'Game terbaru sudah tersedia!',
    image: '/images/promo3.jpg',
    buttonText: 'Cek Sekarang',
    buttonLink: '/games'
  },
];

export default function PromoSlider() {
  return (
    <div className="w-full relative group">
      {/* Gaming Frame */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-30 blur group-hover:opacity-50 transition-opacity duration-500" />
      
      <div className="relative">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 border-slate-700"
        >
          {promos.map((promo) => (
            <SwiperSlide key={promo.id} className="relative">
              {/* Dark Gaming Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/70 to-slate-900/80 z-10" />
              
              {/* Neon Grid Pattern */}
              <div className="absolute inset-0 z-10 opacity-10" style={{
                backgroundImage: 'linear-gradient(to right, rgba(0, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 255, 0.5) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
              
              {/* Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-12">
                {/* Promo Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 rounded-full mb-4 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Special Offer</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {promo.title}
                </h2>
                <p className="text-base md:text-xl mb-6 max-w-md text-gray-300 leading-relaxed">
                  {promo.description}
                </p>
                
                <a 
                  href={promo.buttonLink}
                  className="group/btn relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {promo.buttonText}
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
              
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover opacity-40"
                  priority
                />
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl z-20" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-purple-500/50 rounded-bl-xl z-20" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style jsx>{`
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #06b6d4 !important;
          background: rgba(15, 23, 42, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          border: 2px solid rgba(6, 182, 212, 0.5) !important;
        }
        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          background: rgba(6, 182, 212, 0.2) !important;
          border-color: #06b6d4 !important;
        }
        :global(.swiper-button-next::after),
        :global(.swiper-button-prev::after) {
          font-size: 16px !important;
        }
        :global(.swiper-pagination-bullet) {
          background: rgba(6, 182, 212, 0.5) !important;
          width: 10px !important;
          height: 10px !important;
        }
        :global(.swiper-pagination-bullet-active) {
          background: #06b6d4 !important;
          width: 24px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </div>
  );
}
