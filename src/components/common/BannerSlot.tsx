"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBannersPublic, trackBannerClick } from "@/services/banner.client";
import type { BannerPosition } from "@/types/banner.types";
import Image from "next/image";

interface BannerSlotProps {
    position: BannerPosition;
    className?: string;
}

export default function BannerSlot({ position, className = "" }: BannerSlotProps) {
    const { data: banners = [], isLoading } = useQuery({
        queryKey: ["publicBanners", position],
        queryFn: () => fetchBannersPublic(position),
    });

    const handleBannerClick = (id: string) => {
        trackBannerClick(id).catch((err) =>
            console.error(`Gagal mencatat click banner ${id}:`, err)
        );
    };

    const resolveImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
            return path;
        }
        return path;
    };

    if (isLoading) {
        return (
            <div className={`w-full h-32 md:h-48 bg-slate-200 dark:bg-slate-800/50 animate-pulse rounded-2xl ${className}`} />
        );
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            {banners.map((banner) => (
                <a
                    key={banner.id}
                    href={banner.linkUrl || "#"}
                    onClick={() => handleBannerClick(banner.id)}
                    className="relative block w-full rounded-2xl overflow-hidden shadow-md group border border-slate-200 dark:border-slate-800/80 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                        aspectRatio: "21 / 9",
                    }}
                >
                    {/* Background image & gradient overlay */}
                    <div className="absolute inset-0 z-0">
                        {/* Desktop image */}
                        <Image
                            src={resolveImageUrl(banner.imageDesktop)}
                            alt={banner.altText}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            className={`object-cover group-hover:scale-[1.02] transition-transform duration-500 ${banner.imageMobile ? 'hidden md:block' : ''}`}
                            style={{ objectPosition: banner.objectPosition || "center center" }}
                        />
                        {/* Mobile image if available */}
                        {banner.imageMobile && (
                            <Image
                                src={resolveImageUrl(banner.imageMobile)}
                                alt={banner.altText}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500 block md:hidden"
                                style={{ objectPosition: banner.objectPosition || "center center" }}
                            />
                        )}
                        {/* Gradient overlay to ensure text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-10" />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-8 text-white max-w-[75%]">
                        <h3 className="text-lg md:text-2xl font-black mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent truncate">
                            {banner.title}
                        </h3>
                        {banner.subtitle && (
                            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3 line-clamp-2">
                                {banner.subtitle}
                            </p>
                        )}
                        {banner.ctaText && (
                            <span className="self-start text-[10px] md:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                {banner.ctaText}
                            </span>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
}
