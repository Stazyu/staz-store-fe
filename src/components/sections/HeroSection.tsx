import GameCard from '../home/GameCard';
import { gamesList, voucherList } from '@/constants/games';

export default function HeroSection() {
  return (
    <div className="relative pb-20">
      {/* Background with Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-slate-100/30 to-slate-200/50 dark:via-slate-900/50 dark:to-slate-950 transition-colors duration-500" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.03] transition-opacity duration-500" style={{
        backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Popular Games Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-cyan-400 via-cyan-500 to-purple-500 rounded-full shadow-lg shadow-cyan-500/50" />
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 dark:from-cyan-400 dark:via-cyan-300 dark:to-purple-400 bg-clip-text text-transparent transition-all duration-500">
                Game Populer
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/30 to-red-500/30 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-500/40 dark:border-orange-500/30 rounded-full backdrop-blur-sm transition-all duration-500">
              <span className="text-xl">🔥</span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-300 uppercase tracking-wide transition-colors duration-500">Trending</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base ml-5 transition-colors duration-500">Game paling diminati dan sering di top up</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {gamesList.filter(game => game.isPopular).map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent transition-colors duration-500" />
      </div>

      {/* All Games Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-purple-400 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50" />
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 dark:from-purple-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-500">
                Semua Game
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/40 dark:border-purple-500/30 rounded-full backdrop-blur-sm transition-all duration-500">
              <span className="text-xl">🎮</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wide transition-colors duration-500">{gamesList.length} Games</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base ml-5 transition-colors duration-500">Pilih game favoritmu dan top up sekarang</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {gamesList.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent transition-colors duration-500" />
      </div>

      {/* Voucher Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-pink-400 via-pink-500 to-orange-500 rounded-full shadow-lg shadow-pink-500/50" />
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 via-pink-500 to-orange-600 dark:from-pink-400 dark:via-pink-300 dark:to-orange-400 bg-clip-text text-transparent transition-all duration-500">
                Voucher Digital
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/30 to-orange-500/30 dark:from-pink-500/20 dark:to-orange-500/20 border border-pink-500/40 dark:border-pink-500/30 rounded-full backdrop-blur-sm transition-all duration-500">
              <span className="text-xl">🎁</span>
              <span className="text-xs font-bold text-pink-600 dark:text-pink-300 uppercase tracking-wide transition-colors duration-500">Special</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base ml-5 transition-colors duration-500">Voucher untuk berbagai kebutuhan digitalmu</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {voucherList.map((voucher) => (
            <GameCard key={voucher.id} {...voucher} />
          ))}
        </div>
      </section>
    </div>
  );
}
