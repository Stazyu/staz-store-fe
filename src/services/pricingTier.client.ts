import { fetchWithJwt } from "@/lib/api-client";

export interface PricingTier {
    id: string;
    name: string;
    level?: number;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/pricing-tiers`;

export const fetchPricingTiers = async (): Promise<PricingTier[]> => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        });

        const data: ApiResponse<PricingTier[]> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data pricing tiers');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error in fetchPricingTiers:', error);
        throw error;
    }
};
