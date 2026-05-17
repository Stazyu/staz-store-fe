import { fetchWithJwt } from '@/lib/api-client';
import { TopupInvoice, CreateInvoiceDto, DirectAdjustmentDto, BalanceResponse, AdminInvoicesParams, AdminInvoicesResponse } from '@/types/topup.types';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/topups'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/topups`;

// --- USER ENDPOINTS ---

export const createInvoice = async (data: CreateInvoiceDto): Promise<TopupInvoice> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal membuat invoice top up');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};

export const getMyInvoices = async (): Promise<TopupInvoice[]> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal mengambil riwayat invoice');
        return resData.data || resData || [];
    } catch (error) {
        throw error;
    }
};

export const getInvoiceDetail = async (code: string): Promise<TopupInvoice> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices/${code}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal mengambil detail invoice');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};

export const cancelInvoice = async (code: string): Promise<TopupInvoice> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices/${code}/cancel`, {
            method: 'POST',
            credentials: 'include',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal membatalkan invoice');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};

export const getBalance = async (): Promise<BalanceResponse> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/balance`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal mengambil saldo');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};


// --- ADMIN ENDPOINTS ---

// Admin can also use getMyInvoices but to get all, usually there's another endpoint or it returns all for admin.
// Wait, the specification from user says GET /api/v1/topups/invoices -> "list invoice saya". 
// Let's assume for admin we might need a generic GET /api/v1/topups/invoices?all=true or similar?
// Usually, GET invoices handles role validation. I will just pass a query param or use it directly.
export const getAllInvoices = async (): Promise<TopupInvoice[]> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal mengambil data riwayat top up');
        return resData.data || resData || [];
    } catch (error) {
        throw error;
    }
};

export const getAdminInvoices = async (params: AdminInvoicesParams = {}): Promise<AdminInvoicesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod);
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.offset !== undefined) searchParams.set('offset', String(params.offset));

    const qs = searchParams.toString();
    const url = `${API_BASE_URL}/admin/invoices${qs ? `?${qs}` : ''}`;

    try {
        const response = await fetchWithJwt(url, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal mengambil data invoice admin');
        return resData;
    } catch (error) {
        throw error;
    }
};

export const approveInvoice = async (code: string): Promise<TopupInvoice> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices/${code}/approve`, {
            method: 'POST',
            credentials: 'include',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal menyetujui invoice');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};

export const rejectInvoice = async (code: string): Promise<TopupInvoice> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/invoices/${code}/reject`, {
            method: 'POST',
            credentials: 'include',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal menolak invoice');
        return resData.data || resData;
    } catch (error) {
        throw error;
    }
};

export const directAdjustment = async (userId: string, data: DirectAdjustmentDto): Promise<any> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/users/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Gagal menyesuaikan saldo');
        return resData;
    } catch (error) {
        throw error;
    }
};
