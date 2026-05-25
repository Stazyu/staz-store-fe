export interface Category {
    id: string;
    name: string;
    displayName?: string;
    sortOrder?: number | null;
    brandCount: number;
    color?: string;
    icon?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCategoryDto {
    name: string;
    displayName?: string;
    sortOrder?: number | null;
}

export type CategoryListResponse = {
    categories: Category[]
};
export type CategoryByIdResponse = Category;

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
