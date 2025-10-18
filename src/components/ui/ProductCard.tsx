import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  category: string[];
  type: string;
  isPopular?: boolean;
}

export default function GameCard({ id, title, image, category, type, isPopular = false }: GameCardProps) {
  return (
    <Link href={`/topup/${type}/${id}`}>
      <div className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 flex flex-col h-full">
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-2xl" />

        {/* Image Container */}
        <div className="relative w-full pt-[100%] overflow-hidden">
          <div className="absolute inset-0 p-3">
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 group-hover:border-cyan-500/30 transition-all duration-300">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                priority
              />
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent dark:from-slate-900/90 dark:via-slate-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-700 -translate-x-full group-hover:translate-x-full" />
            </div>
          </div>

          {/* Popular Badge */}
          {isPopular && (
            <div className="absolute top-3 left-3 z-10 animate-pulse">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg shadow-orange-500/50 backdrop-blur-sm border border-orange-400/30">
                <span className="text-sm">🔥</span>
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Hot</span>
              </div>
            </div>
          )}

          {/* Hover Icon */}
          <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 shadow-lg shadow-cyan-500/50">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{category.join(' • ')}</p>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-all duration-500" />
      </div>
    </Link>
  );
}
