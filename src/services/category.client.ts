export interface Category {
    id: string;
    name: string;
    brandCount: number;
    color?: string;
    icon?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCategoryDto {
    name: string;
    brandCount: number;
    is_active?: boolean;
    color?: string;
    icon?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    categories?: T[];
}

const API_BASE_URL = '/api/categories';

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: ApiResponse<Category> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data kategori');
        }

        return data.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData: CreateCategoryDto): Promise<Category> => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoryData),
        });

        const data: ApiResponse<Category> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat kategori');
        }

        if (!data.data) {
            throw new Error('Data kategori tidak ditemukan dalam respons');
        }

        return data.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id: string, categoryData: Partial<CreateCategoryDto>): Promise<Category> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoryData),
        });

        const data: ApiResponse<Category> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal memperbarui kategori');
        }

        if (!data.data) {
            throw new Error('Data kategori tidak ditemukan dalam respons');
        }

        return data.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data: ApiResponse<void> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal menghapus kategori');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
