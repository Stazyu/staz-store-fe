// Client-side service untuk memanggil API routes Next.js
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

export interface Brand {
    id: number;
    name: string;
    code: string;
    category?: string | CategoryObject;
    categoryId: string;
    publisher: string | PublisherObject;
    logo?: string;
    type?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    brands?: T[];
}

const API_BASE_URL = '/api/brands';

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

        return data.brands || [];
    } catch (error) {
        console.error('Error in fetchBrands:', error);
        throw error;
    }
};

export const fetchBrandById = async (id: number): Promise<Brand> => {
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
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(brandData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat brand baru');
        }
        console.log(data.brand);

        return data.brand!;
    } catch (error) {
        console.error('Error in createBrand:', error);
        throw error;
    }
};

export const updateBrand = async (id: number, brandData: Partial<Brand>): Promise<Brand> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(brandData),
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            throw new Error(data.message || 'Gagal memperbarui brand');
        }

        return data.brand;
    } catch (error) {
        console.error('Error in updateBrand:', error);
        throw error;
    }
};

export const deleteBrand = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
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
