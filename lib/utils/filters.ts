import { Product, ProductFilter, ProductSort } from '@/types/product';

/**
 * Product filtering and sorting utilities
 */

export function filterProducts(products: Product[], filters: ProductFilter): Product[] {
  return products.filter(product => {
    // Genre filter
    if (filters.genre && product.genre !== filters.genre) {
      return false;
    }
    
    // Condition filter
    if (filters.condition && product.condition !== filters.condition) {
      return false;
    }
    
    // Format filter
    if (filters.format && product.format !== filters.format) {
      return false;
    }
    
    // Decade filter
    if (filters.decade && product.decade !== filters.decade) {
      return false;
    }
    
    // Price range filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    
    // Stock filter
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        product.title,
        product.artist,
        product.genre,
        product.label,
        product.description,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  return [...products].sort((a, b) => {
    let aValue: any = a[sort.field];
    let bValue: any = b[sort.field];
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Handle date comparison
    if (sort.field === 'createdAt' && aValue && bValue) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function paginateProducts<T>(items: T[], page: number, limit: number) {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;
  
  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
}

export function getUniqueValues<T>(items: T[], key: keyof T): T[keyof T][] {
  const values = items.map(item => item[key]);
  return [...new Set(values)].filter(Boolean);
}

export function getDecadeFromYear(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}
