import { useQuery } from '@tanstack/react-query';
import authClient from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '@/lib/roles';

interface UseAuthSessionOptions {
    redirectTo?: string;
    requireAdmin?: boolean;
}

export function useAuthSession(options: UseAuthSessionOptions = {}) {
    const { redirectTo, requireAdmin } = options;
    const router = useRouter();

    const query = useQuery({
        queryKey: ['auth-session'],
        queryFn: async () => {
            const { data, error } = await authClient.getSession({
                fetchOptions: {
                    cache: 'no-store',
                    credentials: 'include',
                }
            });
            if (error || !data) {
                return null;
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });

    useEffect(() => {
        if (!query.isPending) {
            if (!query.data) {
                if (redirectTo) {
                    router.push(redirectTo);
                }
            } else if (requireAdmin && !isAdmin(query.data.user.role)) {
                router.push('/');
            }
        }
    }, [query.data, query.isPending, redirectTo, requireAdmin, router]);

    return query;
}
