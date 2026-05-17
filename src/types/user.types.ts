export type Role = 'ADMIN' | 'BASIC' | 'RESELLER' | 'OFFLINE';

export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    telegramId?: string | null;
    whatsappId?: string | null;
    role: Role;
    sellOffline: boolean;
    balance: number;
    orders?: any[];
    createdAt: string;
    updatedAt?: string | null;
    emailVerified: boolean;
    image?: string | null;
    banned: boolean;
    banReason?: string | null;
    banExpires?: string | null;
    pricingTierId?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    whatsappId?: string;
    telegramId?: string;
    role?: Role;
    balance?: number;
    banned?: boolean;
    banReason?: string;
    banExpires?: string;
    phoneNumber?: string;
    sellOffline?: boolean;
    emailVerified?: boolean;
    pricingTierId?: string;
}


export interface ApiResponse<T> {
    message?: string;
    data?: T;
    users?: T; // Handle inconsistent backend response wrapping if necessary
    error?: string;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
