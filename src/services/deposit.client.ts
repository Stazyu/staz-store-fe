import { fetchWithJwt } from "@/lib/api-client";

export interface DepositUser {
    id: string;
    name: string;
    email: string;
}

export interface Deposit {
    id: string;
    invoiceCode: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    paymentRef: string | null;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
    user?: DepositUser;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface DepositsResponse {
    success: boolean;
    data: Deposit[];
    pagination: PaginationMeta;
}

export interface FetchDepositsParams {
    userId?: string;
    status?: string;
    paymentMethod?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/deposits'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/deposits`;

export const fetchAdminDeposits = async (params: FetchDepositsParams = {}): Promise<DepositsResponse> => {
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal mengambil data deposit');
        }

        // Return wrapping or mapped response
        return {
            success: true,
            data: data.data || [],
            pagination: data.pagination || { total: 0, limit: 50, offset: 0 }
        };
    } catch (error) {
        console.error('Error in fetchAdminDeposits:', error);
        throw error;
    }
};

export const approveDeposit = async (code: string): Promise<any> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${code}/approve`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menyetujui deposit');
        }

        return data;
    } catch (error) {
        console.error('Error in approveDeposit:', error);
        throw error;
    }
};

export const rejectDeposit = async (code: string): Promise<any> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${code}/reject`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menolak deposit');
        }

        return data;
    } catch (error) {
        console.error('Error in rejectDeposit:', error);
        throw error;
    }
};
