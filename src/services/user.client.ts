import { User, UpdateUserDto, ApiResponse } from '@/types/user';
import { fetchWithJwt } from '@/lib/api-client';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`;

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data user');
        }

        return data.users || data.data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUser = async (id: string, userData: UpdateUserDto): Promise<User> => {
    try {
        const response = await fetchWithJwt(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal memperbarui user');
        }

        return data.data || data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
