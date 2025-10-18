'use client';

import dynamic from 'next/dynamic';
import HeroSection from '@/components/sections/HeroSection';
// import FlashSale from '@/components/flashSale/FlashSaleSection';
import HeroBanner from '@/components/home/HeroBanner';
import * as React from "react"

// Dynamically import the PromoSlider to avoid SSR issues with Swiper
const PromoSlider = dynamic(() => import('@/components/home/PromoSlider'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
});

export default function Home() {
  return (
    <main className="min-h-screen transition-colors relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Modern Background with Mesh Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10 transition-colors duration-500" />

      {/* Animated Gradient Orbs - Dark Mode */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse transition-opacity duration-500" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse transition-opacity duration-500" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/3 to-violet-500/3 dark:from-indigo-500/5 dark:to-violet-500/5 rounded-full blur-3xl -z-10 animate-pulse transition-opacity duration-500" style={{ animationDelay: '4s' }} />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.02] transition-opacity duration-500" style={{
        backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Content Container */}
      <div className="relative">
        {/* Hero Banner Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <HeroBanner />
        </div>

        {/* Promo Slider Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <PromoSlider />
        </div>

        {/* Products Section */}
        <HeroSection />
      </div>
    </main>
  );
}
