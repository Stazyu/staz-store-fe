import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/services/dashboard.client";
import type { DashboardPayload } from "@/types/dashboard";

export function useAdminDashboardQuery() {
    return useQuery<DashboardPayload, Error>({
        queryKey: ["admin-dashboard"],
        queryFn: () => getAdminDashboard(),
        staleTime: 30_000,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
}
