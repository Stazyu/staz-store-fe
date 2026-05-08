import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAdminDashboard } from "@/services/dashboard.client";
import type { DashboardPayload } from "@/types/dashboard";

export function useAdminDashboardQuery(period: string = 'month') {
    return useQuery<DashboardPayload, Error>({
        queryKey: ["admin-dashboard", period],
        queryFn: () => getAdminDashboard(period),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
}
