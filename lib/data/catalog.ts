import { Product, ProductFilter, ProductSort, CatalogResponse } from '@/types/product';
import { isFeatureEnabled, isSquareConfigured } from '@/lib/features';
import { filterProducts, sortProducts, paginateProducts } from '@/lib/utils/filters';
import { demoProducts } from './demo';

/**
 * Data abstraction layer for catalog
 * Returns demo data OR Square data based on feature flags
 */

export async function getCatalogItems(
  filters: ProductFilter = {},
  sort: ProductSort = { field: 'title', direction: 'asc' },
  page: number = 1,
  limit: number = 20
): Promise<CatalogResponse> {
  // Check if Square integration is enabled and configured
  if (isFeatureEnabled('ENABLE_SQUARE_SYNC') && isSquareConfigured()) {
    return getSquareCatalog(filters, sort, page, limit);
  }
  
  // Fall back to demo data
  return getDemoCatalog(filters, sort, page, limit);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isFeatureEnabled('ENABLE_SQUARE_SYNC') && isSquareConfigured()) {
    return getSquareProduct(id);
  }
  
  // Fall back to demo data
  return demoProducts.find(product => product.id === id) || null;
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  if (isFeatureEnabled('ENABLE_SQUARE_SYNC') && isSquareConfigured()) {
    return getSquareFeaturedProducts(limit);
  }
  
  // Fall back to demo data
  return demoProducts.slice(0, limit);
}

export async function getNewArrivals(limit: number = 12): Promise<Product[]> {
  if (isFeatureEnabled('ENABLE_SQUARE_SYNC') && isSquareConfigured()) {
    return getSquareNewArrivals(limit);
  }
  
  // Fall back to demo data
  const sorted = demoProducts
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return sorted.slice(0, limit);
}

// Demo data implementation
async function getDemoCatalog(
  filters: ProductFilter,
  sort: ProductSort,
  page: number,
  limit: number
): Promise<CatalogResponse> {
  let products = [...demoProducts];
  
  // Apply filters
  products = filterProducts(products, filters);
  
  // Apply sorting
  products = sortProducts(products, sort);
  
  // Apply pagination
  const { items, pagination } = paginateProducts(products, page, limit);
  
  return {
    products: items,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    hasMore: pagination.hasMore,
  };
}

// Square data implementation (placeholder - will be implemented when credentials arrive)
async function getSquareCatalog(
  filters: ProductFilter,
  sort: ProductSort,
  page: number,
  limit: number
): Promise<CatalogResponse> {
  // TODO: Implement Square API integration
  // This will be implemented in Phase 2 when credentials are available
  throw new Error('Square integration not yet implemented');
}

async function getSquareProduct(id: string): Promise<Product | null> {
  // TODO: Implement Square API integration
  throw new Error('Square integration not yet implemented');
}

async function getSquareFeaturedProducts(limit: number): Promise<Product[]> {
  // TODO: Implement Square API integration
  throw new Error('Square integration not yet implemented');
}

async function getSquareNewArrivals(limit: number): Promise<Product[]> {
  // TODO: Implement Square API integration
  throw new Error('Square integration not yet implemented');
}
