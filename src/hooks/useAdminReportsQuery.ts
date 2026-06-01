import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAdminReports } from "@/services/reports.client";
import type { ReportsPayload } from "@/services/reports.client";

export function useAdminReportsQuery(startDate?: string, endDate?: string) {
    return useQuery<ReportsPayload, Error>({
        queryKey: ["admin-reports", startDate, endDate],
        queryFn: () => getAdminReports(startDate, endDate),
        placeholderData: keepPreviousData,
        staleTime: 60_000, // 1 minute cached
        refetchOnWindowFocus: true,
    });
}
