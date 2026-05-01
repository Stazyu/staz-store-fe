import type { GetProductsParams } from "@/types/product.types";

/** Default pagination / sort params used across product listing pages. */
export const DEFAULT_PRODUCT_PARAMS: Required<
  Pick<GetProductsParams, "page" | "limit" | "sortBy" | "sortOrder">
> = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};
