import { PaymentMethodCategory } from './paymentMethod.types';

export interface PurchaseFooterProps {
    isMobile: boolean;
    selectedOption: {
        price: number;
        // Add other properties of selectedOption if they exist
        [key: string]: string | number | boolean | undefined; // More specific than 'any'
    };
    formData: {
        playerId: string;
        nickname?: string;
        server?: string;
        serverId?: string;
        phoneNumber?: string;
        paymentMethod: string;
    };
    finalPrice: number;
    isSubmitting: boolean;
    isIdVerified: boolean;
    PAYMENT_METHODS: PaymentMethodCategory[];
}

export interface PurchaseFormData {
    playerId: string;
    nickname?: string;
    server?: string;
    serverId?: string;
    phoneNumber?: string;
    paymentMethod: string;
    // Add other form fields as needed
    [key: string]: string | number | boolean | undefined;
}
