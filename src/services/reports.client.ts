import { fetchWithJwt } from "@/lib/api-client";

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/admin/reports'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports`;

export interface ReportSummary {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    averageOrderValue: number;
    newCustomers: number;
    revenueGrowth: number;
    profitGrowth: number;
    transactionGrowth: number;
    aovGrowth: number;
    customerGrowth: number;
}

export interface DailySale {
    date: string;
    revenue: number;
    profit: number;
    success: number;
    failed: number;
    total: number;
}

export interface CategoryDistributionItem {
    name: string;
    value: number;
    revenue: number;
    profit: number;
    transactions: number;
    color: string;
}

export interface PaymentMethodItem {
    name: string;
    value: number;
    transactions: number;
    revenue: number;
    color: string;
}

export interface TopProductItem {
    id: number;
    productId: string | null;
    name: string;
    brandName: string;
    categoryName: string;
    sales: number;
    revenue: number;
    profit: number;
}

export interface ReportsPayload {
    summary: ReportSummary;
    dailySales: DailySale[];
    categoryDistribution: CategoryDistributionItem[];
    paymentMethods: PaymentMethodItem[];
    topProducts: TopProductItem[];
}

export const getAdminReports = async (startDate?: string, endDate?: string): Promise<ReportsPayload> => {
    try {
        const url = new URL(API_BASE_URL, window.location.origin);
        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);

        const response = await fetchWithJwt(url.toString(), {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data laporan');
        }

        const resData = await response.json();
        return (resData?.data?.data ?? resData?.data ?? resData) as ReportsPayload;
    } catch (error) {
        console.error('Error in getAdminReports:', error);
        throw error;
    }
};
