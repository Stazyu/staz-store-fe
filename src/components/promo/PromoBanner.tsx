'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchBannersPublic, trackBannerClick } from '@/services/banner.client';

const PromoBanner = () => {
  const { data: dbBanners = [], isLoading } = useQuery({
    queryKey: ['publicBanners', 'HOME_PROMO_SECTION'],
    queryFn: () => fetchBannersPublic('HOME_PROMO_SECTION'),
  });

  const handleBannerClick = (id: string) => {
    trackBannerClick(id).catch((err) =>
      console.error(`Gagal mencatat click banner ${id}:`, err)
    );
  };

  const resolveImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return path;
  };

  if (isLoading) {
    return (
      <div className="w-full relative h-64 md:h-80 lg:h-96 bg-slate-900/60 rounded-xl border border-white/5 animate-pulse flex flex-col justify-center p-8 md:p-16 mb-8">
        <div className="h-4 w-24 bg-slate-800 rounded-full mb-4" />
        <div className="h-10 w-2/3 bg-slate-800 rounded-lg mb-3" />
        <div className="h-4 w-1/2 bg-slate-800 rounded-lg mb-6" />
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (dbBanners.length > 0) {
    return (
      <div className="flex flex-col gap-6 mb-8">
        {dbBanners.map((banner) => (
          <div
            key={banner.id}
            className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 group border border-white/5 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(8,17,31,0.4)]"
          >
            {/* Dark Gaming Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent z-10" />

            {/* Neon Grid Pattern */}
            <div className="absolute inset-0 z-10 opacity-5 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-16 max-w-[75%]">
              <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight text-transparent bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text drop-shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-sm md:text-lg mb-6 text-slate-300 font-medium leading-relaxed drop-shadow-sm max-w-xl">
                  {banner.subtitle}
                </p>
              )}
              <a
                href={banner.linkUrl || '#'}
                onClick={() => handleBannerClick(banner.id)}
                className="group/btn relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs md:text-sm font-extrabold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {banner.ctaText || 'Lihat Detail'}
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </a>
            </div>

            {/* Background Image */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src={resolveImageUrl(banner.imageDesktop)}
                alt={banner.altText || banner.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className={`object-cover opacity-60 group-hover:scale-[1.03] transition-transform duration-[6s] ease-out ${banner.imageMobile ? 'hidden md:block' : ''}`}
                style={{ objectPosition: banner.objectPosition || 'center center' }}
                priority
              />
              {banner.imageMobile && (
                <Image
                  src={resolveImageUrl(banner.imageMobile)}
                  alt={banner.altText || banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover opacity-60 group-hover:scale-[1.03] transition-transform duration-[6s] ease-out block md:hidden"
                  style={{ objectPosition: banner.objectPosition || 'center center' }}
                  priority
                />
              )}
            </div>

            {/* HUD Details */}
            <div className="absolute top-4 left-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-cyan-400/40 pointer-events-none select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-ping" />
              <span>PROMO.LIVE</span>
            </div>
            <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-purple-400/40 pointer-events-none select-none">
              <span>STAZ-STORE // PROMO_SECT</span>
            </div>

            {/* Cyber Corner Borders */}
            <div className="absolute top-4 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg z-20 pointer-events-none" />
            <div className="absolute bottom-4 left-6 w-12 h-12 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg z-20 pointer-events-none" />
          </div>
        ))}
      </div>
    );
  }

  // Fallback to static design if no database banners exist (fixed layout & design, no broken image)
  return (
    <div className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 mb-8 group border border-white/5 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(8,17,31,0.4)]">
      {/* Dark Gaming Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent z-10" />

      {/* Neon Grid Pattern */}
      <div className="absolute inset-0 z-10 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-16 max-w-[75%]">
        <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight text-transparent bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text drop-shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
          Diskon Hingga 70%
        </h2>
        <p className="text-sm md:text-lg mb-6 text-slate-300 font-medium leading-relaxed drop-shadow-sm max-w-xl">
          Raih kesempatan terbatas untuk mendapatkan diskon besar-besaran di semua produk game favoritmu!
        </p>
        <Link
          href="/"
          className="group/btn relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs md:text-sm font-extrabold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Lihat Semua Game
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>

      {/* Premium Animated Mesh Gradient Background Fallback */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0c0f1d] via-[#17112c] to-[#0f172a] overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl slide-mesh-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl slide-mesh-orb-2" />
      </div>

      {/* HUD Details */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-cyan-400/40 pointer-events-none select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-ping" />
        <span>PROMO.LIVE</span>
      </div>
      <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-purple-400/40 pointer-events-none select-none">
        <span>STAZ-STORE // PROMO_SECT</span>
      </div>

      {/* Cyber Corner Borders */}
      <div className="absolute top-4 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg z-20 pointer-events-none" />
      <div className="absolute bottom-4 left-6 w-12 h-12 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg z-20 pointer-events-none" />

      <style jsx>{`
        /* Mesh Fallback float animations */
        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }

        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1.1); }
        }

        .slide-mesh-orb-1 {
          animation: floatOrb1 12s ease-in-out infinite;
        }

        .slide-mesh-orb-2 {
          animation: floatOrb2 15s ease-in-out infinite;
          animation-delay: -3s;
        }
      `}</style>
    </div>
  );
};

export default PromoBanner;

