"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiClock, FiArrowUp, FiArrowDown } from "react-icons/fi";

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

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number): { value: number; isIncrease: boolean } => {
    if (previous === 0) return { value: 100, isIncrease: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.round(change * 100) / 100, // Round to 2 decimal places
        isIncrease: change >= 0
    };
};

export function DashboardSummary({
    today,
    yesterday,
}: DashboardSummaryProps) {
    // Calculate percentage changes
    const revenueChange = calculateChange(today.totalRevenue, yesterday.totalRevenue);
    const transactionsChange = calculateChange(today.totalTransactions, yesterday.totalTransactions);
    const avgTransactionChange = calculateChange(today.avgTransaction, yesterday.avgTransaction);
    const successRateChange = calculateChange(today.successRate, yesterday.successRate);

    const summaryCards = [
        {
            title: "Total Pendapatan",
            value: `Rp ${today.totalRevenue.toLocaleString('id-ID')}`,
            icon: <FiDollarSign className="h-5 w-5 text-blue-500" />,
            description: "Hari ini",
            change: revenueChange,
            previousValue: `Rp ${yesterday.totalRevenue.toLocaleString('id-ID')}`,
        },
        {
            title: "Total Transaksi",
            value: today.totalTransactions,
            icon: <FiShoppingBag className="h-5 w-5 text-green-500" />,
            description: "Hari ini",
            change: transactionsChange,
            previousValue: yesterday.totalTransactions,
        },
        {
            title: "Rata-rata Transaksi",
            value: `Rp ${today.avgTransaction.toLocaleString('id-ID')}`,
            icon: <FiTrendingUp className="h-5 w-5 text-purple-500" />,
            description: "Per transaksi",
            change: avgTransactionChange,
            previousValue: `Rp ${yesterday.avgTransaction.toLocaleString('id-ID')}`,
        },
        {
            title: "Tingkat Keberhasilan",
            value: `${today.successRate}%`,
            icon: <FiClock className="h-5 w-5 text-orange-500" />,
            description: "Transaksi berhasil",
            change: successRateChange,
            previousValue: `${yesterday.successRate}%`,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card, index) => {
                const ChangeIcon = card.change.isIncrease ? FiArrowUp : FiArrowDown;
                const changeColor = card.change.isIncrease ? 'text-green-500' : 'text-red-500';

                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className="h-5 w-5">
                                {card.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <div className="flex items-center gap-1">
                                <div className={`flex items-center text-xs ${changeColor}`}>
                                    <ChangeIcon className="h-3 w-3 mr-1" />
                                    {Math.abs(card.change.value)}%
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    vs {card.previousValue} kemarin
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

// Helper function to calculate summary for a given date
export function calculateSummary(transactions: Array<{
    date: string;
    status: "success" | "pending" | "failed";
    total: number;
}>, targetDate: string): {
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    avgTransaction: number;
} {
    // Filter transactions for the target date
    const dateTransactions = transactions.filter(
        (tx) => tx.date.startsWith(targetDate)
    );

    // Calculate metrics
    const totalRevenue = dateTransactions
        .filter(tx => tx.status === 'success')
        .reduce((sum, tx) => sum + tx.total, 0);

    const totalTransactions = dateTransactions.length;

    const successfulTransactions = dateTransactions.filter(
        (tx) => tx.status === 'success'
    ).length;

    const successRate = totalTransactions > 0
        ? Math.round((successfulTransactions / totalTransactions) * 100)
        : 0;

    const avgTransaction = successfulTransactions > 0
        ? Math.round(totalRevenue / successfulTransactions)
        : 0;

    return {
        totalRevenue,
        totalTransactions,
        successRate,
        avgTransaction,
    };
}

// Helper function to calculate today's and yesterday's summary
export function calculateTodaysSummary(transactions: Array<{
    date: string;
    status: "success" | "pending" | "failed";
    total: number;
}>) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return {
        today: calculateSummary(transactions, todayStr),
        yesterday: calculateSummary(transactions, yesterdayStr)
    };
}
