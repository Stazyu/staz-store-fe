import { fetchWithJwt } from "@/lib/api-client";

export interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    provider: string;
    category: string;
    isActive: boolean;
    feeType: "NONE" | "FLAT" | "PERCENT" | "FLAT_PERCENT";
    feeFlat: number;
    feePercent: number; // in basis points: 70 = 0.7%
    feeMin: number | null;
    feeMax: number | null;
    feeChargedTo: "CUSTOMER" | "MERCHANT";
    sortOrder: number;
    iconUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FetchPaymentMethodsParams {
    isActive?: boolean;
    category?: string;
}

const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/payment-methods"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods`;

export const fetchPaymentMethodsAdmin = async (
    params: FetchPaymentMethodsParams = {},
): Promise<PaymentMethod[]> => {
    const queryParams = new URLSearchParams();
    if (params.isActive !== undefined) {
        queryParams.append("isActive", String(params.isActive));
    }
    if (params.category) {
        queryParams.append("category", params.category);
    }
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetchWithJwt(`${API_BASE_URL}${qs}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data metode pembayaran");
    }

    return data.data || [];
};

export const createPaymentMethod = async (
    body: Partial<PaymentMethod>,
): Promise<PaymentMethod> => {
    const response = await fetchWithJwt(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal membuat metode pembayaran");
    }

    return data.data;
};

export const updatePaymentMethod = async (
    id: string,
    body: Partial<PaymentMethod>,
): Promise<PaymentMethod> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui metode pembayaran");
    }

    return data.data;
};

export const togglePaymentMethodStatus = async (
    id: string,
): Promise<PaymentMethod> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/status`, {
        method: "PATCH",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah status metode pembayaran");
    }

    return data.data;
};
