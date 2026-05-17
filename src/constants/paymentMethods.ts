import { PaymentMethod, PaymentMethodCategory } from "@/types/paymentMethod.types";

// Individual payment methods
const PAYMENT_METHODS_DATA: PaymentMethod[] = [
  {
    id: 'balance',
    name: 'Saldo',
    fee: 0,
    feeType: 'percentage',
    icon: '≡ƒÆ░',
    image: '/images/payments/balance.png',
    category: 'balance'
  },
  {
    id: 'qris',
    name: 'QRIS',
    fee: 0.007,
    feeType: 'percentage',
    icon: '≡ƒÆ│',
    image: '/images/payments/qris.webp',
    category: 'qris'
  },
  {
    id: 'gopay',
    name: 'Gopay',
    fee: 0,
    feeType: 'percentage',
    icon: '≡ƒÆ│',
    image: '/images/payments/gopay.png',
    category: 'e-wallet'
  },
  {
    id: 'dana',
    name: 'DANA',
    fee: 0,
    feeType: 'percentage',
    icon: '≡ƒÆ│',
    image: '/images/payments/dana.png',
    category: 'e-wallet'
  },
  {
    id: 'ovo',
    name: 'OVO',
    fee: 0.05,
    feeType: 'percentage',
    icon: '≡ƒÆ│',
    image: '/images/payments/ovo.png',
    category: 'e-wallet'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    fee: 0,
    feeType: 'percentage',
    icon: '≡ƒ¢ì∩╕Å',
    image: '/images/payments/shopeepay.png',
    category: 'e-wallet'
  },
  {
    id: 'bca',
    name: 'Bank BCA',
    fee: 3000,
    feeType: 'fixed',
    icon: '≡ƒÅª',
    image: '/images/payments/bca.png',
    category: 'bank-transfer'
  },
  {
    id: 'bri',
    name: 'Bank BRI',
    fee: 0,
    feeType: 'fixed',
    icon: '≡ƒÅª',
    image: '/images/payments/bri.png',
    category: 'bank-transfer'
  },
  {
    id: 'bni',
    name: 'Bank BNI',
    fee: 0,
    feeType: 'fixed',
    icon: '≡ƒÅª',
    image: '/images/payments/bni.png',
    category: 'bank-transfer'
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    fee: 0,
    feeType: 'fixed',
    icon: '≡ƒÅª',
    image: '/images/payments/mandiri.png',
    category: 'bank-transfer'
  },
];

// Categorized payment methods
export const PAYMENT_METHOD_CATEGORIES: PaymentMethodCategory[] = [
  {
    id: 'balance',
    name: 'Saldo',
    defaultOpen: true,
    methods: PAYMENT_METHODS_DATA.filter(method => method.category === 'balance')
  },
  {
    id: 'qris',
    name: 'QRIS',
    defaultOpen: true,
    methods: PAYMENT_METHODS_DATA.filter(method => method.category === 'qris')
  },
  {
    id: 'e-wallet',
    name: 'E-Wallet',
    defaultOpen: false,
    methods: PAYMENT_METHODS_DATA.filter(method => method.category === 'e-wallet')
  },
  {
    id: 'bank-transfer',
    name: 'Transfer Bank',
    defaultOpen: false,
    methods: PAYMENT_METHODS_DATA.filter(method => method.category === 'bank-transfer')
  },
];

// Flattened version for backward compatibility
export const PAYMENT_METHODS: PaymentMethod[] = PAYMENT_METHODS_DATA;
