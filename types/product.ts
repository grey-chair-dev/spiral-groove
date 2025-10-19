/**
 * Product types matching Square API structure
 * Used for both demo data and real Square data
 */

export interface Product {
  id: string;
  title: string;
  artist?: string;
  price: number;
  cover?: string;
  description?: string;
  genre?: string;
  condition?: 'New' | 'Used - Excellent' | 'Used - Very Good' | 'Used - Good' | 'Used - Fair';
  format?: 'LP' | 'EP' | 'Single' | 'CD' | 'Cassette';
  decade?: string;
  year?: number;
  label?: string;
  catalogNumber?: string;
  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  genre?: string;
  condition?: string;
  format?: string;
  decade?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductSort {
  field: 'title' | 'artist' | 'price' | 'year' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface CatalogResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
