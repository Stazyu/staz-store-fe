import { fetchWithJwt } from "@/lib/api-client";
import type { DashboardPayload } from "@/types/dashboard";

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/admin/dashboard'
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard`;

export const getAdminDashboard = async (): Promise<DashboardPayload> => {
    try {
        const response = await fetchWithJwt(API_BASE_URL, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data dashboard');
        }

        const resData = await response.json();
        if (resData && resData.data && resData.data.data) {
            return resData.data.data;
        }
        if (resData && resData.data) {
            return resData.data;
        }
        return resData;
    } catch (error) {
        console.error('Error in getAdminDashboard:', error);
        throw error;
    }
};
