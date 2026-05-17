import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TypeItem, TypeParams } from "@/types/type.types";
import {
    fetchTypes,
    fetchTypeById,
    createType,
    updateType,
    deleteType,
} from "@/services/type.client";

// -------- Query Keys --------

export const typeKeys = {
    all: ['types'] as const,
    lists: () => [...typeKeys.all, 'list'] as const,
    list: (params?: TypeParams) => [...typeKeys.lists(), params] as const,
    details: () => [...typeKeys.all, 'detail'] as const,
    detail: (id: string) => [...typeKeys.details(), id] as const,
};

// -------- Queries --------

export function useTypes(params?: TypeParams) {
    return useQuery({
        queryKey: typeKeys.list(params),
        queryFn: () => fetchTypes(params),
        placeholderData: (previousData) => previousData,
    });
}

export function useTypeById(id: string | null) {
    return useQuery({
        queryKey: typeKeys.detail(id!),
        queryFn: () => fetchTypeById(id!),
        enabled: !!id,
    });
}

// -------- Mutations --------

export function useCreateType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<TypeItem, 'id' | 'createdAt' | 'updatedAt' | 'brand' | '_count'>) => createType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: typeKeys.lists() });
        },
    });
}

export function useUpdateType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Omit<TypeItem, 'id' | 'createdAt' | 'updatedAt' | 'brand' | '_count'>> }) =>
            updateType(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: typeKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: typeKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: typeKeys.lists() });
        },
    });
}
