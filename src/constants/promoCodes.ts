export interface PromoCode {
    code: string;
    description: string;
    discountAmount: number; // Flat amount or Percentage
    type: 'fixed' | 'percentage';
    minSpend: number;
}

export const DUMMY_PROMO_CODES: PromoCode[] = [
    {
        code: 'STAZHEMAT',
        description: 'Potongan Rp 10.000',
        discountAmount: 10000,
        type: 'fixed',
        minSpend: 20000
    },
    {
        code: 'GAMINGSERU',
        description: 'Potongan Rp 5.000',
        discountAmount: 5000,
        type: 'fixed',
        minSpend: 10000
    },
    {
        code: 'NEWUSER',
        description: 'Potongan Rp 2.000 untuk pengguna baru',
        discountAmount: 2000,
        type: 'fixed',
        minSpend: 0
    },
    {
        code: 'SULTAN',
        description: 'Diskon 10% (Max Rp 50.000)',
        discountAmount: 0.1, // 10%
        type: 'percentage',
        minSpend: 100000
    }
];
