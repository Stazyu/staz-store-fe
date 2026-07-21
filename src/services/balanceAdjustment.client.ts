import { fetchWithJwt } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdjustmentUser {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    balance?: number;
}

export interface BalanceAdjustment {
    id: string;
    userId: string;
    adminId: string;
    approvedBy: string | null;
    type: "CREDIT" | "DEBIT";
    amount: number;
    reason: string;
    balanceBefore: number | null;
    balanceAfter: number | null;
    status: "PENDING" | "APPLIED" | "REJECTED" | "REVERSED";
    reversalOf: string | null;
    reversedBy: string | null;
    createdAt: string;
    updatedAt: string;
    user?: AdjustmentUser;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
}

export interface AdjustmentsResponse {
    success: boolean;
    data: BalanceAdjustment[];
    pagination: PaginationMeta;
}

export interface AdjustmentSummary {
    todayCount: number;
    totalCredit: number;
    totalDebit: number;
    pendingCount: number;
}

export interface FetchAdjustmentsParams {
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface CreateAdjustmentData {
    userId: string;
    type: "CREDIT" | "DEBIT";
    amount: number;
    reason: string;
}

export interface SearchUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    balance: number;
}

// ─── API Base ─────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/balance-adjustments"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/balance-adjustments`;

const USERS_API_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/balance-adjustments/users/search"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/balance-adjustments/users/search`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQueryString(params: Record<string, unknown>): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            queryParams.append(key, String(value));
        }
    });
    const qs = queryParams.toString();
    return qs ? `?${qs}` : "";
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const fetchBalanceAdjustments = async (
    params: FetchAdjustmentsParams = {},
): Promise<AdjustmentsResponse> => {
    const url = `${API_BASE_URL}${buildQueryString(params as Record<string, unknown>)}`;

    const response = await fetchWithJwt(url, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data penyesuaian saldo");
    }

    return {
        success: true,
        data: data.data || [],
        pagination: data.pagination || { total: 0, limit: 20, offset: 0 },
    };
};

export const fetchBalanceAdjustmentSummary = async (): Promise<AdjustmentSummary> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/summary`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil ringkasan penyesuaian saldo");
    }

    return data.data;
};

export const fetchBalanceAdjustmentDetail = async (
    id: string,
): Promise<BalanceAdjustment> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil detail penyesuaian saldo");
    }

    return data.data;
};

export const createBalanceAdjustment = async (
    body: CreateAdjustmentData,
): Promise<BalanceAdjustment> => {
    const response = await fetchWithJwt(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal membuat penyesuaian saldo");
    }

    return data.data;
};

export const approveBalanceAdjustment = async (
    id: string,
): Promise<BalanceAdjustment> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal menyetujui penyesuaian saldo");
    }

    return data.data;
};

export const rejectBalanceAdjustment = async (
    id: string,
): Promise<BalanceAdjustment> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal menolak penyesuaian saldo");
    }

    return data.data;
};

export const reverseBalanceAdjustment = async (
    id: string,
): Promise<BalanceAdjustment> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}/reverse`, {
        method: "PATCH",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal me-reverse penyesuaian saldo");
    }

    return data.data;
};

export const searchAdminUsers = async (q: string): Promise<SearchUser[]> => {
    if (!q || q.trim().length < 2) return [];

    const response = await fetchWithJwt(`${USERS_API_URL}?q=${encodeURIComponent(q)}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mencari user");
    }

    return data.data || [];
};
