import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await fetch('/api/profile', {
                credentials: 'include',
            });
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            // });
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const { user } = await response.json();
            return user;
        },
        retry: false, // Don't retry if 401/404 avoids loop if not logged in
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui profil');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('Profil berhasil diperbarui');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error: any) => {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Terjadi kesalahan saat menyimpan profil');
        },
    });
}
