import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchBalanceAdjustments,
    fetchBalanceAdjustmentSummary,
    fetchBalanceAdjustmentDetail,
    createBalanceAdjustment,
    approveBalanceAdjustment,
    rejectBalanceAdjustment,
    reverseBalanceAdjustment,
    searchAdminUsers,
    type FetchAdjustmentsParams,
    type CreateAdjustmentData,
} from "@/services/balanceAdjustment.client";

// ─── Query Keys ───────────────────────────────────────────────────────────────

const ADJUSTMENT_KEYS = {
    all: ["admin", "balance-adjustments"] as const,
    list: (params: FetchAdjustmentsParams) =>
        [...ADJUSTMENT_KEYS.all, params] as const,
    summary: () => [...ADJUSTMENT_KEYS.all, "summary"] as const,
    detail: (id: string) => [...ADJUSTMENT_KEYS.all, id] as const,
    userSearch: (q: string) => ["admin", "users", "search", q] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

export function useBalanceAdjustments(params: FetchAdjustmentsParams = {}) {
    return useQuery({
        queryKey: ADJUSTMENT_KEYS.list(params),
        queryFn: () => fetchBalanceAdjustments(params),
    });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function useBalanceAdjustmentSummary() {
    return useQuery({
        queryKey: ADJUSTMENT_KEYS.summary(),
        queryFn: () => fetchBalanceAdjustmentSummary(),
    });
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useBalanceAdjustmentDetail(id: string | null) {
    return useQuery({
        queryKey: ADJUSTMENT_KEYS.detail(id ?? ""),
        queryFn: () => fetchBalanceAdjustmentDetail(id!),
        enabled: !!id,
    });
}

// ─── Create Mutation ──────────────────────────────────────────────────────────

export function useCreateBalanceAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAdjustmentData) => createBalanceAdjustment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADJUSTMENT_KEYS.all });
        },
    });
}

// ─── Approve Mutation ─────────────────────────────────────────────────────────

export function useApproveBalanceAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => approveBalanceAdjustment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADJUSTMENT_KEYS.all });
        },
    });
}

// ─── Reject Mutation ──────────────────────────────────────────────────────────

export function useRejectBalanceAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => rejectBalanceAdjustment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADJUSTMENT_KEYS.all });
        },
    });
}

// ─── Reverse Mutation ─────────────────────────────────────────────────────────

export function useReverseBalanceAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reverseBalanceAdjustment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADJUSTMENT_KEYS.all });
        },
    });
}

// ─── User Search ──────────────────────────────────────────────────────────────

export function useAdminUserSearch(q: string) {
    return useQuery({
        queryKey: ADJUSTMENT_KEYS.userSearch(q),
        queryFn: () => searchAdminUsers(q),
        enabled: q.trim().length >= 2,
    });
}
