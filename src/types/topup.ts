export interface TopupInvoice {
    id: string;
    invoiceCode: string;
    userId: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REJECTED';
    paymentMethod?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
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
