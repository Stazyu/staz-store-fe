export interface PaymentMethod {
    id: string;
    name: string;
    fee: number;
    feeType: 'percentage' | 'fixed';
    icon: string;
    image?: string;
    category: 'qris' | 'e-wallet' | 'bank-transfer' | 'balance' | 'other';
}

export interface PaymentMethodCategory {
    id: string;
    name: string;
    methods: PaymentMethod[];
    defaultOpen?: boolean;
}