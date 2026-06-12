import { fetchWithJwt } from "@/lib/api-client";

export interface RefundUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface Refund {
    id: string;
    userId: string;
    productId: string | null;
    trxId: string;
    trxFrom: string;
    dataNo: string;
    dataId: string | null;
    categoryName: string;
    brandName: string;
    typeName: string;
    productName: string;
    basePrice: number;
    price: number;
    profit: number;
    fee: number | null;
    paymentMethod: string;
    salesChannel: string;
    status: 'REFUNDED';
    message: string | null;
    sn: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
    user?: RefundUser;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface RefundsResponse {
    success: boolean;
    data: Refund[];
    pagination: PaginationMeta;
}

export interface FetchRefundsParams {
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/refunds'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/refunds`;

export const fetchAdminRefunds = async (params: FetchRefundsParams = {}): Promise<RefundsResponse> => {
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

        const data: RefundsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data refund');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchAdminRefunds:', error);
        throw error;
    }
};
