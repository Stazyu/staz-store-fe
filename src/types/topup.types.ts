export interface TopupInvoice {
    id: string;
    invoiceCode: string;
    userId: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REJECTED';
    paymentMethod?: string;
    topUpChannel?: 'WEB' | 'TELEGRAM';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminTopupInvoice {
    id: string;
    invoiceCode: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    paymentRef: string | null;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    topUpChannel?: 'WEB' | 'TELEGRAM';
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface AdminInvoicesParams {
    status?: string;
    userId?: string;
    paymentMethod?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface AdminInvoicesResponse {
    data: AdminTopupInvoice[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface CreateInvoiceDto {
    amount: number;
    method?: string;
    notes?: string;
}

export interface DirectAdjustmentDto {
    amount: number;
    type: 'ADD' | 'DEDUCT';
    notes?: string;
}

export interface BalanceResponse {
    balance: number;
}
