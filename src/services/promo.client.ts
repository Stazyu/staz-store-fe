import { fetchWithJwt } from "@/lib/api-client";

export interface PromoTarget {
    id: string;
    promoId: string;
    targetType: "CATEGORY" | "BRAND" | "TYPE" | "PRODUCT" | "PRICING_TIER" | "USER";
    targetValue: string;
}

export interface Promo {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: "DISCOUNT_FIXED" | "DISCOUNT_PERCENT" | "CASHBACK_FIXED" | "CASHBACK_PERCENT" | "FEE_WAIVER";
    value: number;
    maxDiscount: number | null;
    minTransaction: number;
    quota: number;
    usedCount: number;
    reservedCount: number;
    perUserLimit: number | null;
    perTargetLimit: number | null;
    firstTransactionOnly: boolean;
    isPublic: boolean;
    isStackable: boolean;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED";
    targetPaymentMethods: string[];
    minimumMarginAmount: number | null;
    minimumMarginPercent: number | null;
    marginBehavior: "REJECT_PROMO" | "CAP_TO_SAFE_MARGIN";
    createdAt: string;
    updatedAt: string;
    targets?: PromoTarget[];
}

export interface FetchPromosParams {
    search?: string;
    status?: string;
    type?: string;
    isPublic?: boolean;
}

export interface ValidatePromoInput {
    code: string;
    userId: string;
    productId: string;
    paymentMethodCode: string;
    targetId?: string;
}

export interface ValidatePromoResult {
    promoId: string;
    code: string;
    name: string;
    type: string;
    discountAmount: number;
    cashbackAmount: number;
    feeWaiverAmount: number;
    minTransaction: number;
    maxDiscount: number | null;
    originalPrice: number;
}

export interface PromoRedemption {
    id: string;
    promoId: string;
    userId: string;
    orderId: string;
    targetId: string | null;
    discountAmount: number;
    cashbackAmount: number;
    feeWaiverAmount: number;
    redeemedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
    };
    order?: {
        trxId: string;
        productName: string;
        price: number;
        createdAt: string;
    };
}

export interface PromoRedemptionsResponse {
    success: boolean;
    data: PromoRedemption[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/promos"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/promos`;

export const fetchPromosAdmin = async (
    params: FetchPromosParams = {},
): Promise<Promo[]> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.type) queryParams.append("type", params.type);
    if (params.isPublic !== undefined) queryParams.append("isPublic", String(params.isPublic));
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetchWithJwt(`${API_BASE_URL}${qs}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data promo");
    }

    return data.data || [];
};

export const fetchPromoById = async (id: string): Promise<Promo> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil detail promo");
    }

    return data.data;
};

export const createPromo = async (
    body: Partial<Promo> & { targets?: Omit<PromoTarget, "id" | "promoId">[] },
): Promise<Promo> => {
    const response = await fetchWithJwt(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal membuat promo");
    }

    return data.data;
};

export const updatePromo = async (
    id: string,
    body: Partial<Promo> & { targets?: Omit<PromoTarget, "id" | "promoId">[] },
): Promise<Promo> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui promo");
    }

    return data.data;
};

export const deletePromo = async (id: string): Promise<void> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus promo");
    }
};

export const updatePromoStatus = async (
    id: string,
    status: string,
): Promise<Promo> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui status promo");
    }

    return data.data;
};

export const fetchPromoRedemptions = async (
    id: string,
    params: { limit?: number; offset?: number } = {},
): Promise<PromoRedemptionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.offset) queryParams.append("offset", String(params.offset));
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/redemptions${qs}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data log penggunaan promo");
    }

    return data;
};

export const validatePromoCode = async (
    body: ValidatePromoInput,
): Promise<ValidatePromoResult> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Kode promo tidak valid");
    }

    return data.data;
};
