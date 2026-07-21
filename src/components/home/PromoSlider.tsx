'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import Image from 'next/image';

import { useQuery } from "@tanstack/react-query";
import { fetchBannersPublic, trackBannerClick } from "@/services/banner.client";

export default function PromoSlider() {
  const { data: dbBanners = [], isLoading } = useQuery({
    queryKey: ["publicBanners", "HOME_CAROUSEL"],
    queryFn: () => fetchBannersPublic("HOME_CAROUSEL"),
  });

  const handleBannerClick = (id: string, isDb: boolean) => {
    if (isDb) {
      trackBannerClick(id).catch(err => console.error("Error tracking click:", err));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full relative h-64 md:h-[340px] bg-slate-900/60 rounded-xl border border-white/5 animate-pulse flex flex-col justify-center p-8 md:p-14">
        <div className="h-4 w-24 bg-slate-800 rounded-full mb-4" />
        <div className="h-10 w-2/3 bg-slate-800 rounded-lg mb-3" />
        <div className="h-4 w-1/2 bg-slate-800 rounded-lg mb-6" />
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const slides = dbBanners.map(b => ({
    id: b.id,
    title: b.title,
    description: b.subtitle || "",
    image: b.imageDesktop,
    imageMobile: b.imageMobile,
    buttonText: b.ctaText || "Beli Sekarang",
    buttonLink: b.linkUrl || "#",
    objectPosition: b.objectPosition || "center center",
    altText: b.altText,
    isDb: true
  }));

  if (slides.length === 0) {
    return null;
  }

  const resolveImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return path;
  };

  return (
    <div className="w-full relative group">
      {/* Gaming Frame */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/25 via-purple-500/25 to-pink-500/25 rounded-2xl opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-700" />
      
      <div className="relative overflow-hidden rounded-xl border border-white/5 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(8,17,31,0.5)]">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          effect={'fade'}
          fadeEffect={{ crossFade: true }}
          loop={slides.length > 1}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          className="w-full h-64 md:h-[340px]"
        >
          {slides.map((slide) => {
            const isBlankImage = !slide.image || slide.image.includes("blank.png");
            
            return (
              <SwiperSlide key={slide.id} className="relative select-none overflow-hidden">
                {/* Dark Gaming Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent z-10" />
                
                {/* Neon Grid Pattern */}
                <div className="absolute inset-0 z-10 opacity-5 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
                
                {/* HUD Tech Details (Opposite Corners) */}
                <div className="absolute top-4 left-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-cyan-400/40 pointer-events-none select-none slide-corner-tl">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-ping" />
                  <span>SYS.ON // STZ_SRv1.0</span>
                </div>
                <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20 text-[9px] font-mono tracking-widest text-purple-400/40 pointer-events-none select-none slide-corner-br">
                  <span>LATENCY // 12ms</span>
                  <span className="w-1.5 h-1.5 bg-purple-400/70" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-14 md:max-w-[65%]">
                  {/* Promo Badge */}
                  <div className="slide-badge inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4 backdrop-blur-md transform transition-all duration-500 hover:scale-105">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                    </span>
                    <span className="text-cyan-300 text-[10px] font-bold uppercase tracking-widest">Special Offer</span>
                  </div>
                  
                  <h2 className="slide-title text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight text-transparent bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text drop-shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
                    {slide.title}
                  </h2>
                  
                  <p className="slide-desc text-sm md:text-lg mb-6 text-slate-300 font-medium leading-relaxed drop-shadow-sm max-w-lg">
                    {slide.description}
                  </p>
                  
                  <a 
                    href={slide.buttonLink}
                    onClick={() => handleBannerClick(slide.id, slide.isDb)}
                    className="slide-btn group/btn relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-extrabold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {slide.buttonText}
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </a>
                </div>
                
                {/* Background Image / Mesh Fallback */}
                <div className="absolute inset-0 z-0">
                  {isBlankImage ? (
                    /* Premium Animated Mesh Gradient for Empty Image */
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0c0f1d] via-[#17112c] to-[#0f172a] slide-image overflow-hidden">
                      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl slide-mesh-orb-1" />
                      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl slide-mesh-orb-2" />
                    </div>
                  ) : (
                    <>
                      {/* Desktop Image */}
                      <Image
                        src={resolveImageUrl(slide.image)}
                        alt={slide.altText || slide.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        className={`object-cover opacity-60 slide-image ${slide.imageMobile ? 'hidden md:block' : ''}`}
                        style={{ objectPosition: slide.objectPosition }}
                        priority
                      />
                      {/* Mobile Image (if available) */}
                      {slide.imageMobile && (
                        <Image
                          src={resolveImageUrl(slide.imageMobile)}
                          alt={slide.altText || slide.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                          className="object-cover opacity-60 slide-image block md:hidden"
                          style={{ objectPosition: slide.objectPosition }}
                          priority
                        />
                      )}
                    </>
                  )}
                </div>
                
                {/* Cyber Corner Borders (Opposite Corners) */}
                <div className="absolute top-4 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg z-20 pointer-events-none slide-corner-tr shadow-[0_0_8px_rgba(6,182,212,0.15)]" />
                <div className="absolute bottom-4 left-6 w-12 h-12 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg z-20 pointer-events-none slide-corner-bl shadow-[0_0_8px_rgba(168,85,247,0.15)]" />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      
      <style jsx>{`
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #22d3ee !important;
          background: rgba(8, 17, 31, 0.45) !important;
          backdrop-filter: blur(12px) !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          opacity: 0;
          visibility: hidden;
        }
        :global(.swiper-button-next::after),
        :global(.swiper-button-prev::after) {
          font-size: 14px !important;
          font-weight: 900 !important;
        }
        :global(.group:hover .swiper-button-next),
        :global(.group:hover .swiper-button-prev) {
          opacity: 1;
          visibility: visible;
        }
        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          background: rgba(6, 182, 212, 0.25) !important;
          border-color: rgba(6, 182, 212, 0.6) !important;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3) !important;
          transform: scale(1.05);
        }
        :global(.swiper-button-prev) {
          left: 20px !important;
        }
        :global(.swiper-button-next) {
          right: 20px !important;
        }
        :global(.swiper-pagination-bullet) {
          background: rgba(255, 255, 255, 0.35) !important;
          width: 6px !important;
          height: 6px !important;
          transition: all 0.3s ease !important;
        }
        :global(.swiper-pagination-bullet-active) {
          background: #22d3ee !important;
          width: 20px !important;
          border-radius: 9999px !important;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.5) !important;
        }

        /* Slide Entrance Animations */
        :global(.swiper-slide .slide-badge),
        :global(.swiper-slide .slide-title),
        :global(.swiper-slide .slide-desc),
        :global(.swiper-slide .slide-btn),
        :global(.swiper-slide .slide-corner-tr),
        :global(.swiper-slide .slide-corner-bl),
        :global(.swiper-slide .slide-corner-tl),
        :global(.swiper-slide .slide-corner-br) {
          opacity: 0;
          will-change: transform, opacity;
        }

        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandCornerTR {
          from {
            opacity: 0;
            transform: translate(12px, -12px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes expandCornerBL {
          from {
            opacity: 0;
            transform: translate(-12px, 12px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes expandCornerTL {
          from {
            opacity: 0;
            transform: translate(-12px, -12px);
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        @keyframes expandCornerBR {
          from {
            opacity: 0;
            transform: translate(12px, 12px);
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        /* Swiper Active Slide Selectors */
        :global(.swiper-slide-active .slide-badge) {
          animation: slideDownFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        :global(.swiper-slide-active .slide-title) {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }

        :global(.swiper-slide-active .slide-desc) {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.35s;
        }

        :global(.swiper-slide-active .slide-btn) {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }

        :global(.swiper-slide-active .slide-corner-tr) {
          animation: expandCornerTR 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.25s;
        }

        :global(.swiper-slide-active .slide-corner-bl) {
          animation: expandCornerBL 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.25s;
        }

        :global(.swiper-slide-active .slide-corner-tl) {
          animation: expandCornerTL 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
        }

        :global(.swiper-slide-active .slide-corner-br) {
          animation: expandCornerBR 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
        }

        /* Ken Burns Zoom Effect for Banner Image */
        :global(.swiper-slide .slide-image) {
          transform: scale(1.08);
          transition: transform 6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        :global(.swiper-slide-active .slide-image) {
          transform: scale(1);
        }

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

        :global(.slide-mesh-orb-1) {
          animation: floatOrb1 12s ease-in-out infinite;
        }

        :global(.slide-mesh-orb-2) {
          animation: floatOrb2 15s ease-in-out infinite;
          animation-delay: -3s;
        }
      `}</style>
    </div>
  );
}

