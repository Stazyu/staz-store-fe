export interface TypeItem {
    id: string;
    name: string;
    brandId: string;
    prefix: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    brand?: {
        id: string;
        name: string;
        publisher: string;
        categoryId: string;
        category?: {
            id: string;
            name: string;
        };
    };
    _count?: {
        products: number;
    };
}

export interface TypeApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    types?: T[];
    type?: T;
}

export interface TypeParams {
    brandId?: string;
    categoryId?: string;
    search?: string;
}
