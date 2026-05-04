"use client";

import { useEffect, useRef } from "react";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiCheckCircle, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface SummaryData {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    avgTransaction: number;
}

interface DashboardSummaryProps {
    today: SummaryData;
    yesterday: SummaryData;
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

    return (
        <div
            className={`relative group overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-br ${config.bg} backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:${config.glow} hover:-translate-y-1 cursor-default`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Background glow orb */}
            <div
                className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
            />

            {/* Shimmer line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.gradient} opacity-60`} />

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

                <div className={`flex-shrink-0 p-3 rounded-xl ${config.iconRing} ml-4`}>
                    <Icon className="w-5 h-5" />
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

export function DashboardSummary({ today, yesterday }: DashboardSummaryProps) {
    const cards = [
        { key: "revenue", value: today.totalRevenue, prev: yesterday.totalRevenue, change: calculateChange(today.totalRevenue, yesterday.totalRevenue) },
        { key: "transactions", value: today.totalTransactions, prev: yesterday.totalTransactions, change: calculateChange(today.totalTransactions, yesterday.totalTransactions) },
        { key: "avg", value: today.avgTransaction, prev: yesterday.avgTransaction, change: calculateChange(today.avgTransaction, yesterday.avgTransaction) },
        { key: "rate", value: today.successRate, prev: yesterday.successRate, change: calculateChange(today.successRate, yesterday.successRate) },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    return { totalRevenue, totalTransactions, successRate, avgTransaction };
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
