import { Category, CreateCategoryDto, ApiResponse, CategoryListResponse, CategoryByIdResponse } from '@/types/category.types';
import { fetchWithJwt } from '@/lib/api-client';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/categories'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`;

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
        });

        const data: ApiResponse<Category[]> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data kategori');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData: CreateCategoryDto): Promise<Category> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
            credentials: 'include',
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

export const updateCategory = async (id: string, categoryData: Partial<CreateCategoryDto>): Promise<CategoryByIdResponse> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
            credentials: 'include',
        });

        const data: ApiResponse<CategoryByIdResponse> = await response.json();

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
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
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
