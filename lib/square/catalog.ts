/**
 * Square Catalog API adapter
 * Will be implemented when credentials are available
 */

import { Product, ProductFilter, ProductSort, CatalogResponse } from '@/types/product';

// TODO: Implement Square catalog integration when credentials arrive
// This file will contain:
// - Fetch products from Square Catalog API
// - Convert Square product format to our Product type
// - Handle Square-specific filtering and pagination

export async function getSquareProducts(
  filters: ProductFilter,
  sort: ProductSort,
  page: number,
  limit: number
): Promise<CatalogResponse> {
  // TODO: Implement Square Catalog API calls
  throw new Error('Square catalog integration not yet implemented - credentials needed');
}

export async function getSquareProductById(id: string): Promise<Product | null> {
  // TODO: Implement Square Catalog API call for single product
  throw new Error('Square catalog integration not yet implemented - credentials needed');
}

export async function searchSquareProducts(query: string): Promise<Product[]> {
  // TODO: Implement Square Catalog API search
  throw new Error('Square catalog integration not yet implemented - credentials needed');
}
