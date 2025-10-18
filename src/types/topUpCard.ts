export interface TopUpCardProps {
    option: {
        id: number;
        diamonds?: number;
        uc?: number;
        crystals?: number;
        points?: number;
        lunites?: number;
        price: number;
        bonus?: number;
        amount?: number;
    };
    currency: 'diamonds' | 'uc' | 'crystals' | 'points' | 'lunites';
    onSelect: (option: TopUpCardProps['option']) => void;
}