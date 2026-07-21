import { fetchWithJwt } from "@/lib/api-client";

export interface AuditLog {
    id: string;
    actorId: string | null;
    actorName: string | null;
    actorEmail: string | null;
    actorRole: string | null;
    action: string;
    actionLabel: string | null;
    module: string;
    entityType: string | null;
    entityId: string | null;
    reference: string | null;
    status: "SUCCESS" | "FAILED";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string | null;
    before: any;
    after: any;
    changes: any;
    metadata: any;
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
    createdAt: string;
}

export interface PaginationMeta {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
}

export interface AuditLogsResponse {
    success: boolean;
    data: AuditLog[];
    pagination: PaginationMeta;
}

export interface FetchAuditLogsParams {
    search?: string;
    module?: string;
    action?: string;
    status?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}

const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/admin/audit-logs"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/audit-logs`;

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

export const fetchAuditLogs = async (
    params: FetchAuditLogsParams = {},
): Promise<AuditLogsResponse> => {
    const url = `${API_BASE_URL}${buildQueryString(params as Record<string, unknown>)}`;

    const response = await fetchWithJwt(url, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data audit log");
    }

    return {
        success: true,
        data: data.data || [],
        pagination: data.pagination || { total: 0, limit: 20, page: 1, totalPages: 1 },
    };
};

export const fetchAuditLogDetail = async (id: string): Promise<AuditLog> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil detail audit log");
    }

    return data.data;
};

export const downloadAuditLogsCsv = async (params: FetchAuditLogsParams = {}): Promise<void> => {
    const url = `${API_BASE_URL}/export${buildQueryString(params as Record<string, unknown>)}`;
    const response = await fetchWithJwt(url, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengunduh CSV");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};
