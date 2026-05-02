import { fetchWithJwt } from "@/lib/api-client";
import { TypeItem, TypeApiResponse, TypeParams } from "@/types/type.types";

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/types'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/types`;

export const fetchTypes = async (params?: TypeParams): Promise<TypeItem[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.brandId) queryParams.append("brandId", params.brandId);
        if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
        if (params?.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        const fullUrl = `${API_BASE_URL}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: TypeApiResponse<TypeItem> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data type');
        }

        return data.types || (data.data as unknown as TypeItem[]) || [];
    } catch (error) {
        console.error('Error in fetchTypes:', error);
        throw error;
    }
};

export const fetchTypeById = async (id: string): Promise<TypeItem> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: TypeApiResponse<TypeItem> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil detail type');
        }

        return data.type || (data.data as TypeItem);
    } catch (error) {
        console.error('Error in fetchTypeById:', error);
        throw error;
    }
};

export const createType = async (typeData: Omit<TypeItem, 'id' | 'createdAt' | 'updatedAt' | 'brand' | '_count'>): Promise<TypeItem> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(typeData),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat type baru');
        }

        return data.type || data.data;
    } catch (error) {
        console.error('Error in createType:', error);
        throw error;
    }
};

export const updateType = async (id: string, typeData: Partial<Omit<TypeItem, 'id' | 'createdAt' | 'updatedAt' | 'brand' | '_count'>>): Promise<TypeItem> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(typeData),
            credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Gagal memperbarui type');
        }

        return data.type || data.data;
    } catch (error) {
        console.error('Error in updateType:', error);
        throw error;
    }
};

export const deleteType = async (id: string): Promise<void> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data: TypeApiResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus type');
        }
    } catch (error) {
        console.error('Error in deleteType:', error);
        throw error;
    }
};
