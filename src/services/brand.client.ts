import { fetchWithJwt } from "@/lib/api-client";

export interface CategoryObject {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PublisherObject {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BrandMargin {
    tierId: string;
    percentage: number;
}

export interface BrandType {
    id: string;
    name: string;
    code: string;
    prefix: string;
}

export interface Brand {
    id: string;
    name: string;
    code: string;
    category?: string | CategoryObject;
    categoryId: string;
    publisher: string | PublisherObject;
    logo?: string | null;
    profitMethod?: string;
    margins?: BrandMargin[];
    isManualProcess?: boolean;
    isActive?: boolean;
    topLevelCategory?: boolean;
    types?: BrandType[];
    _count?: {
        products: number;
        types: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    brands?: T[];
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/brands'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands`;

export const fetchBrands = async (): Promise<Brand[]> => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: ApiResponse<Brand> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data brand');
        }

        return data.data as unknown as Brand[] || data.brands || [];
    } catch (error) {
        console.error('Error in fetchBrands:', error);
        throw error;
    }
};

export const fetchBrandById = async (id: string): Promise<Brand> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: ApiResponse<Brand> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil detail brand');
        }

        return data.data!;
    } catch (error) {
        console.error('Error in fetchBrandById:', error);
        throw error;
    }
};

export const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(brandData),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat brand baru');
        }

        return data.brand!;
    } catch (error) {
        console.error('Error in createBrand:', error);
        throw error;
    }
};

export const updateBrand = async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(brandData),
            credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Gagal memperbarui brand');
        }

        return data.brand;
    } catch (error) {
        console.error('Error in updateBrand:', error);
        throw error;
    }
};

export const deleteBrand = async (id: string): Promise<void> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data: ApiResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus brand');
        }
    } catch (error) {
        console.error('Error in deleteBrand:', error);
        throw error;
    }
};
