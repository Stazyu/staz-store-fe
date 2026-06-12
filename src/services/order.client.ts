import { fetchWithJwt } from "@/lib/api-client";

export interface OrderProductBrand {
    name: string;
    category?: {
        name: string;
    };
}

export interface OrderProduct {
    name: string;
    brand: OrderProductBrand;
}

export interface OrderUser {
    id: string;
    name: string;
    email: string;
}

export interface Order {
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
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELED';
    message: string | null;
    sn: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string | null;
    user?: OrderUser;
    product?: OrderProduct;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface OrdersResponse {
    success: boolean;
    data: Order[];
    pagination: PaginationMeta;
}

export interface FetchOrdersParams {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/orders'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`;

export const fetchAdminOrders = async (params: FetchOrdersParams = {}): Promise<OrdersResponse> => {
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

        const data: OrdersResponse = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil data order');
        }

        return data;
    } catch (error) {
        console.error('Error in fetchAdminOrders:', error);
        throw error;
    }
};

export const fetchOrderById = async (id: string): Promise<Order> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Gagal mengambil detail order');
        }

        return data.data;
    } catch (error) {
        console.error('Error in fetchOrderById:', error);
        throw error;
    }
};

export const updateOrderStatus = async (
    id: string,
    status: string,
    sn?: string
): Promise<Order> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, sn }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Gagal memperbarui status order');
        }

        return data.data;
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        throw error;
    }
};

export const syncDigiflazz = async (id: string): Promise<any> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}/sync-digiflazz`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Gagal sinkronisasi dengan provider');
        }

        return data;
    } catch (error) {
        console.error('Error in syncDigiflazz:', error);
        throw error;
    }
};

export const syncPendingDigiflazz = async (limit: number = 25): Promise<any> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/digiflazz/sync-pending`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ limit }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Gagal sinkronisasi pending order');
        }

        return data;
    } catch (error) {
        console.error('Error in syncPendingDigiflazz:', error);
        throw error;
    }
};
