import { fetchWithJwt } from "@/lib/api-client";

export interface Payment {
    id: string;
    type: "ORDER" | "DEPOSIT";
    userId: string;
    userName: string;
    userEmail?: string;
    amount: number;
    fee: number;
    status: string; // PAID, PENDING, FAILED
    paymentMethod: string;
    reference?: string;
    channel: string;
    createdAt: string;
    expiredAt: string | null;
    paidAt: string | null;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface PaymentsResponse {
    success: boolean;
    data: Payment[];
    pagination: PaginationMeta;
}

export interface FetchPaymentsParams {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/payments'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments`;

export const fetchAdminPayments = async (params: FetchPaymentsParams = {}): Promise<PaymentsResponse> => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}${queryString ? `?${queryString}` : ''}`;

        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
        });

        const data: PaymentsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data pembayaran');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchAdminPayments:', error);
        throw error;
    }
};
