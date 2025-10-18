export default function HeroBanner() {
    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-500">
            {/* Modern Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl transition-colors duration-500" />
            
            {/* Animated Mesh Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50 transition-colors duration-500" />
            
            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] transition-opacity duration-500" style={{
                backgroundImage: `radial-gradient(circle, rgba(6, 182, 212, 0.4) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }} />
            
            {/* Floating Gradient Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-3xl animate-pulse transition-opacity duration-500" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl animate-pulse transition-opacity duration-500" style={{ animationDelay: '1.5s' }} />
            
            <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 dark:from-cyan-500/10 dark:to-purple-500/10 border border-cyan-500/40 dark:border-cyan-500/30 rounded-full mb-8 backdrop-blur-md shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-500">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 dark:bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 dark:bg-cyan-400 shadow-lg shadow-cyan-500/50 dark:shadow-cyan-400/50"></span>
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-300 text-sm font-bold tracking-wide uppercase transition-colors duration-500">Tersedia 24/7</span>
                    </div>
                    
                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                        <span className="block bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-white dark:via-cyan-100 dark:to-white bg-clip-text text-transparent mb-2 transition-all duration-500">
                            Top Up Game
                        </span>
                        <span className="block bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-500">
                            Cepat & Aman
                        </span>
                    </h1>
                    
                    {/* Description */}
                    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-gray-300 leading-relaxed transition-colors duration-500">
                        Nikmati pengalaman top up yang <span className="text-cyan-600 dark:text-cyan-400 font-semibold">mudah</span>, <span className="text-purple-600 dark:text-purple-400 font-semibold">cepat</span>, dan <span className="text-pink-600 dark:text-pink-400 font-semibold">terpercaya</span> untuk semua game favoritmu
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 shadow-lg">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Top Up Sekarang
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                        
                        <button className="group relative px-8 py-4 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-gray-200 font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Lihat Promo
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                        <div className="group relative bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/60 dark:to-slate-900/60 backdrop-blur-md border border-cyan-500/30 dark:border-cyan-500/20 rounded-2xl p-5 sm:p-6 hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                            <div className="relative">
                                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-cyan-600 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600 bg-clip-text text-transparent">1000+</div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-1">Produk</div>
                            </div>
                        </div>
                        <div className="group relative bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/60 dark:to-slate-900/60 backdrop-blur-md border border-purple-500/30 dark:border-purple-500/20 rounded-2xl p-5 sm:p-6 hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                            <div className="relative">
                                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">24/7</div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-1">Support</div>
                            </div>
                        </div>
                        <div className="group relative bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/60 dark:to-slate-900/60 backdrop-blur-md border border-pink-500/30 dark:border-pink-500/20 rounded-2xl p-5 sm:p-6 hover:border-pink-500/50 dark:hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 dark:hover:shadow-pink-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                            <div className="relative">
                                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-pink-600 to-pink-700 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent">Instan</div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mt-1">Proses</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Corner Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />
        </div>
    );
}
