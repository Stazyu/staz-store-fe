import { fetchWithJwt } from "@/lib/api-client";

export interface MutationUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface BalanceMutation {
    id: string;
    userId: string;
    amount: number;
    balanceAfter: number;
    type: "TOPUP" | "ORDER_DEBIT" | "ORDER_REFUND" | "ADJUSTMENT" | "BONUS" | "FEE";
    reference: string | null;
    invoiceId: string | null;
    orderId: string | null;
    createdAt: string;
    user?: MutationUser;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface MutationsResponse {
    success: boolean;
    data: BalanceMutation[];
    pagination: PaginationMeta;
}

export interface FetchMutationsParams {
    userId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/balance-mutations'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/balance-mutations`;

export const fetchAdminMutations = async (params: FetchMutationsParams = {}): Promise<MutationsResponse> => {
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

        const data: MutationsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data mutasi saldo');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchAdminMutations:', error);
        throw error;
    }
};
