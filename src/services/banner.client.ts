import { fetchWithJwt } from "@/lib/api-client";
import type { Banner, BannerPosition, BannerStatus } from "@/types/banner.types";

const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "/api/v1/banners"
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/banners`;

export interface FetchBannersParams {
    search?: string;
    position?: BannerPosition;
    status?: BannerStatus;
}

export const fetchBannersAdmin = async (params: FetchBannersParams = {}): Promise<Banner[]> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.position && params.position !== "all" as any) queryParams.append("position", params.position);
    if (params.status && params.status !== "all" as any) queryParams.append("status", params.status);
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetchWithJwt(`${API_BASE_URL}/admin/list${qs}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data banner admin.");
    }

    return data.data || [];
};

export const fetchBannersPublic = async (position?: BannerPosition): Promise<Banner[]> => {
    const queryParams = new URLSearchParams();
    if (position) queryParams.append("position", position);
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}${qs}`, {
        method: "GET",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil data banner.");
    }

    return data.data || [];
};

export const createBanner = async (body: Partial<Banner>): Promise<Banner> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal membuat banner.");
    }

    return data.data;
};

export const updateBanner = async (id: string, body: Partial<Banner>): Promise<Banner> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui banner.");
    }

    return data.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus banner.");
    }
};

export const updateBannerStatus = async (id: string, isActive: boolean): Promise<Banner> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui status banner.");
    }

    return data.data;
};

export const duplicateBanner = async (id: string): Promise<Banner> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/${id}/duplicate`, {
        method: "POST",
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal menduplikasi banner.");
    }

    return data.data;
};

export const reorderBanners = async (ids: string[]): Promise<void> => {
    const response = await fetchWithJwt(`${API_BASE_URL}/admin/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengurutkan banner.");
    }
};

export const trackBannerClick = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}/click`, {
        method: "POST",
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mencatat click banner.");
    }
};

export const uploadBannerImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithJwt(`${API_BASE_URL}/admin/upload`, {
        method: "POST",
        credentials: "include",
        body: formData, // fetchWithJwt handles content-type automatically when body is FormData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
    }

    return data.url;
};
