import { fetchWithJwt } from "@/lib/api-client";
import type { DashboardPayload, TransactionStatusItem, TransactionStatusRaw } from "@/types/dashboard.types";

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/admin/dashboard'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard`;

/** Status key → display label & color */
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    success:  { label: "Sukses",      color: "#22d3ee" },
    pending:  { label: "Pending",     color: "#a78bfa" },
    failed:   { label: "Gagal",       color: "#f87171" },
    refunded: { label: "Refund",      color: "#fb923c" },
    canceled: { label: "Dibatalkan",  color: "#f472b6" },
};

/** Convert the raw status object into an array suitable for Recharts */
function transformTransactionStatus(raw?: TransactionStatusRaw | null): TransactionStatusItem[] {
    if (!raw || typeof raw !== "object") return [];
    return (Object.keys(STATUS_CONFIG) as (keyof TransactionStatusRaw)[]).map((key) => ({
        key,
        name: STATUS_CONFIG[key].label,
        value: raw[key] ?? 0,
        color: STATUS_CONFIG[key].color,
    }));
}

export const getAdminDashboard = async (period: string = 'month'): Promise<DashboardPayload> => {
    try {
        const url = new URL(API_BASE_URL, window.location.origin);
        if (period) url.searchParams.append('period', period);

        const response = await fetchWithJwt(url.toString(), {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data dashboard');
        }

        const resData = await response.json();

        // Unwrap nested response: { success, data: { data: ... } } or { success, data: ... }
        const payload = resData?.data?.data ?? resData?.data ?? resData;

        // Transform transactionStatus from object → array if it's not already an array
        if (payload.transactionStatus && !Array.isArray(payload.transactionStatus)) {
            payload.transactionStatus = transformTransactionStatus(payload.transactionStatus);
        }

        return payload as DashboardPayload;
    } catch (error) {
        console.error('Error in getAdminDashboard:', error);
        throw error;
    }
};
