"use client";

import { useEffect, useRef } from "react";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface SummaryData {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    avgTransaction: number;
    totalProfit: number;
}

interface DashboardSummaryProps {
    today?: SummaryData;
    yesterday?: SummaryData;
    summary?: {
        totalRevenueToday: number;
        totalTransactionsToday: number;
        averageTransactionToday: number;
        successRateToday: number;
        totalProfitToday: number;
        revenueGrowthPercent: number;
        transactionGrowthPercent: number;
        averageTransactionGrowthPercent: number;
        successRateGrowthPercent: number;
        profitGrowthPercent: number;
        totalRevenueYesterday?: number;
        totalTransactionsYesterday?: number;
        averageTransactionYesterday?: number;
        successRateYesterday?: number;
        totalProfitYesterday?: number;
    }
}


const calculateChange = (current: number, previous: number): { value: number; isIncrease: boolean } => {
    if (previous === 0) return { value: 100, isIncrease: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.round(change * 100) / 100, isIncrease: change >= 0 };
};

function useCountUp(target: number, duration = 1200) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            el.textContent = Math.floor(start).toLocaleString("id-ID");
            if (start >= target) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return ref;
}

const CARD_CONFIGS = [
    {
        key: "revenue",
        title: "Total Pendapatan",
        description: "Pendapatan hari ini",
        icon: FiDollarSign,
        gradient: "from-blue-500 to-cyan-400",
        glow: "shadow-blue-500/25",
        border: "border-blue-500/20",
        bg: "from-blue-500/10 to-cyan-500/5",
        iconRing: "bg-blue-500/20 text-blue-400",
        formatValue: (v: number) => `Rp ${v.toLocaleString("id-ID")}`,
        isNumericCount: false,
    },
    {
        key: "profit",
        title: "Total Keuntungan",
        description: "Keuntungan hari ini",
        icon: FiTrendingUp,
        gradient: "from-rose-500 to-red-600",
        glow: "shadow-rose-500/25",
        border: "border-rose-500/20",
        bg: "from-rose-500/10 to-red-500/5",
        iconRing: "bg-rose-500/20 text-rose-400",
        formatValue: (v: number) => `Rp ${v.toLocaleString("id-ID")}`,
        isNumericCount: false,
    },
    {
        key: "transactions",
        title: "Total Transaksi",
        description: "Transaksi hari ini",
        icon: FiShoppingBag,
        gradient: "from-violet-500 to-purple-400",
        glow: "shadow-violet-500/25",
        border: "border-violet-500/20",
        bg: "from-violet-500/10 to-purple-500/5",
        iconRing: "bg-violet-500/20 text-violet-400",
        formatValue: (v: number) => v.toString(),
        isNumericCount: true,
    },
    {
        key: "avg",
        title: "Rata-rata Transaksi",
        description: "Per transaksi",
        icon: FiTrendingUp,
        gradient: "from-emerald-500 to-teal-400",
        glow: "shadow-emerald-500/25",
        border: "border-emerald-500/20",
        bg: "from-emerald-500/10 to-teal-500/5",
        iconRing: "bg-emerald-500/20 text-emerald-400",
        formatValue: (v: number) => `Rp ${v.toLocaleString("id-ID")}`,
        isNumericCount: false,
    },
    {
        key: "rate",
        title: "Tingkat Keberhasilan",
        description: "Transaksi berhasil",
        icon: FiCheckCircle,
        gradient: "from-orange-500 to-amber-400",
        glow: "shadow-orange-500/25",
        border: "border-orange-500/20",
        bg: "from-orange-500/10 to-amber-500/5",
        iconRing: "bg-orange-500/20 text-orange-400",
        formatValue: (v: number) => `${v}%`,
        isNumericCount: false,
    },
];

function StatCard({
    config,
    value,
    prevValue,
    change,
    index,
}: {
    config: typeof CARD_CONFIGS[0];
    value: number;
    prevValue: number;
    change: { value: number; isIncrease: boolean };
    index: number;
}) {
    const countRef = useCountUp(value, 1000 + index * 100);
    const Icon = config.icon;
    const ChangeIcon = change.isIncrease ? FiArrowUp : FiArrowDown;

    // Dinamis untuk kartu profit dan rata-rata transaksi
    const isDynamicCard = config.key === "profit" || config.key === "avg";
    
    const colors = isDynamicCard ? (
        change.isIncrease ? {
            gradient: "from-emerald-500 to-teal-400",
            glow: "shadow-emerald-500/25",
            border: "border-emerald-500/20",
            bg: "from-emerald-500/10 to-teal-500/5",
            iconRing: "bg-emerald-500/20 text-emerald-400",
        } : {
            gradient: "from-rose-500 to-red-600",
            glow: "shadow-rose-500/25",
            border: "border-rose-500/20",
            bg: "from-rose-500/10 to-red-500/5",
            iconRing: "bg-rose-500/20 text-rose-400",
        }
    ) : {
        gradient: config.gradient,
        glow: config.glow,
        border: config.border,
        bg: config.bg,
        iconRing: config.iconRing,
    };

    return (
        <div
            className={`relative group overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:${colors.glow} hover:-translate-y-1 cursor-default`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Background glow orb */}
            <div
                className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
            />

            {/* Shimmer line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient} opacity-60`} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                        {config.title}
                    </p>
                    <div className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">
                        {config.isNumericCount ? (
                            <span ref={countRef}>0</span>
                        ) : (
                            <span>{config.formatValue(value)}</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                </div>

                <div className={`flex-shrink-0 p-3 rounded-xl ${colors.iconRing} ml-4`}>
                    {isDynamicCard ? (
                        change.isIncrease ? <FiTrendingUp className="w-5 h-5" /> : <FiTrendingDown className="w-5 h-5" />
                    ) : (
                        <Icon className="w-5 h-5" />
                    )}
                </div>
            </div>

            {/* Change badge */}
            <div className="relative mt-4 flex items-center gap-2">
                <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${change.isIncrease
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}
                >
                    <ChangeIcon className="w-3 h-3" />
                    {Math.abs(change.value)}%
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-600">
                    vs {config.formatValue(prevValue)} kemarin
                </span>
            </div>
        </div>
    );
}

const safePrevValue = (val: number, change: number) => {
    if (!isFinite(change) || isNaN(change) || change === -100) return 0;
    const calc = val / (1 + change / 100);
    return isFinite(calc) && !isNaN(calc) ? Math.round(calc) : 0;
};

export function DashboardSummary({ today, yesterday, summary }: DashboardSummaryProps) {
    const cards = summary ? [
        {
            key: "revenue",
            value: summary.totalRevenueToday ?? 0,
            prev: summary.totalRevenueYesterday ?? 0,
            change: { value: summary.revenueGrowthPercent ?? 0, isIncrease: (summary.revenueGrowthPercent ?? 0) >= 0 }
        },
        {
            key: "profit",
            value: summary.totalProfitToday ?? 0,
            prev: summary.totalProfitYesterday ?? 0,
            change: { value: summary.profitGrowthPercent ?? 0, isIncrease: (summary.profitGrowthPercent ?? 0) >= 0 }
        },
        {
            key: "transactions",
            value: summary.totalTransactionsToday ?? 0,
            prev: summary.totalTransactionsYesterday ?? 0,
            change: { value: summary.transactionGrowthPercent ?? 0, isIncrease: (summary.transactionGrowthPercent ?? 0) >= 0 }
        },
        {
            key: "avg",
            value: summary.averageTransactionToday ?? 0,
            prev: summary.averageTransactionYesterday ?? 0,
            change: { value: summary.averageTransactionGrowthPercent ?? 0, isIncrease: (summary.averageTransactionGrowthPercent ?? 0) >= 0 }
        },
        {
            key: "rate",
            value: summary.successRateToday ?? 0,
            prev: summary.successRateYesterday ?? 0,
            change: { value: summary.successRateGrowthPercent ?? 0, isIncrease: (summary.successRateGrowthPercent ?? 0) >= 0 }
        },
    ] : [
        { key: "profit", value: today?.totalProfit ?? 0, prev: yesterday?.totalProfit ?? 0, change: calculateChange(today?.totalProfit ?? 0, yesterday?.totalProfit ?? 0) },
        { key: "revenue", value: today?.totalRevenue ?? 0, prev: yesterday?.totalRevenue ?? 0, change: calculateChange(today?.totalRevenue ?? 0, yesterday?.totalRevenue ?? 0) },
        { key: "transactions", value: today?.totalTransactions ?? 0, prev: yesterday?.totalTransactions ?? 0, change: calculateChange(today?.totalTransactions ?? 0, yesterday?.totalTransactions ?? 0) },
        { key: "avg", value: today?.avgTransaction ?? 0, prev: yesterday?.avgTransaction ?? 0, change: calculateChange(today?.avgTransaction ?? 0, yesterday?.avgTransaction ?? 0) },
        { key: "rate", value: today?.successRate ?? 0, prev: yesterday?.successRate ?? 0, change: calculateChange(today?.successRate ?? 0, yesterday?.successRate ?? 0) },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card, i) => (
                <StatCard
                    key={card.key}
                    config={CARD_CONFIGS[i]}
                    value={card.value}
                    prevValue={card.prev}
                    change={card.change}
                    index={i}
                />
            ))}
        </div>
    );
}

export function calculateSummary(
    transactions: Array<{ date: string; status: "success" | "pending" | "failed"; total: number }>,
    targetDate: string
) {
    const dateTransactions = transactions.filter((tx) => tx.date.startsWith(targetDate));
    const totalRevenue = dateTransactions.filter((tx) => tx.status === "success").reduce((sum, tx) => sum + tx.total, 0);
    const totalTransactions = dateTransactions.length;
    const successfulTransactions = dateTransactions.filter((tx) => tx.status === "success").length;
    const successRate = totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0;
    const avgTransaction = successfulTransactions > 0 ? Math.round(totalRevenue / successfulTransactions) : 0;
    const totalProfit = totalRevenue * 0.1; // Fallback dummy logic if needed
    return { totalRevenue, totalTransactions, successRate, avgTransaction, totalProfit };
}

export function calculateTodaysSummary(
    transactions: Array<{ date: string; status: "success" | "pending" | "failed"; total: number }>
) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
        today: calculateSummary(transactions, today.toISOString().split("T")[0]),
        yesterday: calculateSummary(transactions, yesterday.toISOString().split("T")[0]),
    };
}
