export interface Game {
    id: string;
    title: string;
    image: string;
    category: string[];
    description: string;
    topUpOptions: {
        id: number;
        diamonds?: number;
        uc?: number;
        crystals?: number;
        points?: number;
        lunites?: number;
        price: number;
        bonus?: number;
    }[];
}

export interface ProductCardProps {
    id: string;
    title: string;
    game: string;
    price: number;
    oldPrice: number;
    discount: number;
    stock: number;
    soldOut: boolean;
    image: string;
}
