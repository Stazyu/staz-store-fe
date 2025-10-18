import FlashSaleCard from './FlashSaleCard';
import { useState, useEffect } from 'react';

const dummyProducts = [
    {
        id: 'gacha-naruto-1',
        title: "Gacha Naruto",
        game: "Mobile Legends",
        price: 1136574,
        oldPrice: 1235406,
        discount: 8,
        stock: 138,
        soldOut: false,
        image: 'https://i.pinimg.com/736x/ec/9d/d3/ec9dd32c001ab51f4637a6d56b0e22e1.jpg',
    },
    {
        id: 'weekly-diamond-pass-1',
        title: "Weekly Diamond Pass (x3)",
        game: "Mobile Legends",
        price: 82058,
        oldPrice: 83733,
        discount: 5,
        stock: 0,
        soldOut: true,
        image: 'https://i.pinimg.com/736x/8c/fa/ff/8cfaffbfa7aa9e957bb6da56f7fed781.jpg',
    },
];

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date('2025-06-02T16:32:29');
            const diff = end.getTime() - now.getTime();

            if (diff < 0) {
                clearInterval(timer);
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    .toString()
                    .padStart(2, '0');
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    .toString()
                    .padStart(2, '0');
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    .toString()
                    .padStart(2, '0');

                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-6">
            <div className="flex items-center mb-4">
                <div className="flex items-center">
                    <div className="p-1.5 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                        FLASH SALE
                    </h2>
                </div>
                <div className="ml-auto flex items-center space-x-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-md border border-red-50 dark:border-gray-700">
                    <div className="flex items-center space-x-1.5">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Berakhir dalam</div>
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-br from-red-500 to-amber-500 text-white font-semibold text-sm px-2 py-1 rounded-md min-w-[2rem] text-center">
                                {timeLeft.hours}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Jam</span>
                        </div>
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 -mb-1.5">:</div>
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-br from-red-500 to-amber-500 text-white font-semibold text-sm px-2 py-1 rounded-md min-w-[2rem] text-center">
                                {timeLeft.minutes}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Menit</span>
                        </div>
                        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 -mb-1.5">:</div>
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-br from-red-500 to-amber-500 text-white font-semibold text-sm px-2 py-1 rounded-md min-w-[2rem] text-center">
                                {timeLeft.seconds}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Detik</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex overflow-x-auto pb-2 -mx-1.5">
                {dummyProducts.map((product, index) => (
                    <div key={index} className="flex-none w-52 mx-1.5">
                        <FlashSaleCard {...product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
