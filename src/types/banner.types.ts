export type BannerPosition =
    | "HOME_HERO"
    | "HOME_CAROUSEL"
    | "HOME_PROMO_SECTION"
    | "PRODUCT_TOP"
    | "CATEGORY_TOP"
    | "CHECKOUT_TOP";

export type BannerStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";

export interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string | null;
    linkUrl: string | null;
    imageDesktop: string;
    imageMobile: string | null;
    altText: string;
    objectPosition: string;
    position: BannerPosition;
    order: number;
    status: BannerStatus;
    startsAt: string | null;
    endsAt: string | null;
    views: number;
    clicks: number;
    createdAt: string;
    updatedAt: string;
    displayStatus?: BannerStatus; // Live status calculated dynamically
}
