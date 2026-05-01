import { fetchWithJwt } from "@/lib/api-client";

export interface TransactionMetadata {
    productId?: string;
    productName?: string;
    brandName?: string;
    categoryName?: string;
    dataNo?: string;
    dataId?: string;
    sn?: string;
    profit?: number;
    salesChannel?: string;
    message?: string;
    [key: string]: any;
}

export interface Transaction {
    id: string;
    type: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    paymentMethod: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    metadata: TransactionMetadata;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface TransactionsResponse {
    success: boolean;
    data: Transaction[];
    pagination: PaginationMeta;
}

export interface TransactionResponse {
    success: boolean;
    data: Transaction;
}

export interface FetchTransactionsParams {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions`;

export const fetchAdminTransactions = async (params: FetchTransactionsParams = {}): Promise<TransactionsResponse> => {
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

        const data: TransactionsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data transaksi');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchAdminTransactions:', error);
        throw error;
    }
};

export const fetchTransactionsByCategory = async (categoryId: string, params: FetchTransactionsParams = {}): Promise<TransactionsResponse> => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/category/${categoryId}${queryString ? `?${queryString}` : ''}`;

        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
        });

        const data: TransactionsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data transaksi berdasarkan kategori');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchTransactionsByCategory:', error);
        throw error;
    }
};

export const fetchTransactionById = async (id: string, type?: string): Promise<Transaction> => {
    try {
        const queryParams = new URLSearchParams();
        if (type) queryParams.append("type", type);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/${id}${queryString ? `?${queryString}` : ''}`;

        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
        });

        const data: TransactionResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil detail transaksi');
        }

        return data.data;
    } catch (error) {
        console.error('Error in fetchTransactionById:', error);
        throw error;
    }
};

export const fetchRecentTransactions = async (limit: number = 5): Promise<TransactionsResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/recent?limit=${limit}`, {
            method: 'GET',
            cache: 'no-store',
        });

        const data: TransactionsResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil detail transaksi recent');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchRecentTransactions:', error);
        throw error;
    }
};

export interface TransactionSummaryData {
    today: { total: number; count: number };
    yesterday: { total: number; count: number };
    [key: string]: any;
}

export interface SummaryResponse {
    success: boolean;
    data: TransactionSummaryData;
}

export const fetchTransactionSummary = async (params: { userId?: string, startDate?: string, endDate?: string } = {}): Promise<SummaryResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.append("userId", params.userId);
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/summary${queryString ? `?${queryString}` : ''}`;

        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
        });

        const data: SummaryResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil summary transaksi');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchTransactionSummary:', error);
        throw error;
    }
};
