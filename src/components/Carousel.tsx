// components/Carousel.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';

export default function Carousel() {
    const slides = [
        {
            title: 'Lapakgaming Coins Rewards',
            image: '/rewards-slide-1.png',
        },
        {
            title: 'Diskon Buat New User',
            image: '/rewards-slide-2.png',
        },
        {
            title: 'Event Naruto ML',
            image: '/rewards-slide-3.png',
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop
                spaceBetween={20}
                slidesPerView={1}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
