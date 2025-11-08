/**
 * Square Catalog API adapter
 * Handles product images, categories, and inventory from Square API
 */

import { Product, ProductFilter, ProductSort, CatalogResponse } from '@/types/product';
import { squareClient, isSquareConfigured } from '@/lib/square';

/**
 * Get Square product image URL
 * Square image IDs can be used to construct image URLs
 * Note: When Square credentials are live, images will be retrieved via Square's image API
 */
function getSquareImageUrl(imageId: string): string | null {
  if (!isSquareConfigured()) return null;
  
  // Square images are typically accessible via their image ID
  // This will be updated when Square credentials are configured
  // For now, return null to use placeholders
  return null;
}

/**
 * Get category name from Square category ID
 * Categories are included in the catalog list response
 */
function getSquareCategoryName(categoryId: string, catalogObjects: any[]): string | null {
  if (!isSquareConfigured()) return null;
  
  // Find category in catalog objects
  const category = catalogObjects.find(obj => obj.id === categoryId && obj.type === 'CATEGORY');
  return category?.categoryData?.name || null;
}

/**
 * Convert Square catalog item to our Product type
 * Handles images, categories, price, availability, and condition
 */
function convertSquareItemToProduct(item: any, catalogObjects: any[]): Product {
  const itemData = item.itemData;
  const variation = itemData?.variations?.[0];
  const variationData = variation?.itemVariationData;
  
  // Get image URL if available
  // When Square credentials are live, images will be retrieved properly
  let imageUrl: string | undefined;
  if (itemData?.imageIds?.[0]) {
    const url = getSquareImageUrl(itemData.imageIds[0]);
    if (url) {
      imageUrl = url;
    } else {
      // For now, use placeholder until Square image API is configured
      // This will be replaced with actual Square image URLs
      imageUrl = undefined;
    }
  }
  
  // Get category name if available
  let category: string | undefined;
  if (itemData?.categoryId) {
    const categoryName = getSquareCategoryName(itemData.categoryId, catalogObjects);
    if (categoryName) category = categoryName;
  }
  
  // Extract price (Square stores in cents)
  const priceMoney = variationData?.priceMoney;
  const price = priceMoney ? priceMoney.amount / 100 : 0;
  
  // Determine condition from custom attributes or description
  let condition: Product['condition'] | undefined;
  const conditionAttr = itemData?.customAttributeValues?.find(
    (attr: any) => attr.customAttribute?.name?.toLowerCase() === 'condition'
  );
  if (conditionAttr?.stringValue) {
    condition = conditionAttr.stringValue as Product['condition'];
  }
  
  // Extract format from custom attributes or tags
  let format: Product['format'] | undefined;
  const formatAttr = itemData?.customAttributeValues?.find(
    (attr: any) => attr.customAttribute?.name?.toLowerCase() === 'format'
  );
  if (formatAttr?.stringValue) {
    format = formatAttr.stringValue as Product['format'];
  }
  
  return {
    id: item.id,
    title: itemData?.name || 'Unknown Product',
    artist: itemData?.description?.split(' by ')[1]?.split('\n')[0],
    price,
    cover: imageUrl,
    description: itemData?.description,
    genre: category,
    condition,
    format,
    inStock: variationData?.trackInventory !== false,
    stockQuantity: variationData?.inventoryAlertThreshold,
    sku: variationData?.sku,
    tags: itemData?.taxIds || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Get products from Square Catalog API
 * Supports filtering, sorting, and pagination
 */
export async function getSquareProducts(
  filters: ProductFilter,
  sort: ProductSort,
  page: number,
  limit: number
): Promise<CatalogResponse> {
  if (!isSquareConfigured()) {
    throw new Error('Square API not configured');
  }
  
  try {
    const { catalogApi } = squareClient;
    const response = await catalogApi.listCatalog();
    
    if (!response.result?.objects) {
      return { products: [], total: 0, page, limit, hasMore: false };
    }
    
    // Filter to get only items
    const items = response.result.objects.filter((item: any) => item.type === 'ITEM');
    const allObjects = response.result.objects; // For category lookup
    
    // Convert Square items to our Product type
    const products = items.map((item: any) => convertSquareItemToProduct(item, allObjects));
    
    // Apply filters
    let filteredProducts = products;
    if (filters.genre) {
      filteredProducts = filteredProducts.filter((p: Product) => p.genre === filters.genre);
    }
    if (filters.condition) {
      filteredProducts = filteredProducts.filter((p: Product) => p.condition === filters.condition);
    }
    if (filters.format) {
      filteredProducts = filteredProducts.filter((p: Product) => p.format === filters.format);
    }
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.inStock === filters.inStock);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: Product) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.artist?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filteredProducts.sort((a: Product, b: Product) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      
      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });
    
    // Apply pagination
    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  } catch (error) {
    console.error('Error fetching Square products:', error);
    throw error;
  }
}

/**
 * Get a single product by ID from Square
 */
export async function getSquareProductById(id: string): Promise<Product | null> {
  if (!isSquareConfigured()) {
    throw new Error('Square API not configured');
  }
  
  try {
    const { catalogApi } = squareClient;
    const response = await catalogApi.listCatalog();
    
    if (response.result?.objects) {
      const item = response.result.objects.find((obj: any) => obj.id === id && obj.type === 'ITEM');
      if (item) {
        return convertSquareItemToProduct(item, response.result.objects);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Square product:', error);
    return null;
  }
}

/**
 * Search products in Square catalog
 * Note: Full search functionality requires Square API search methods
 * For now, this filters the catalog list client-side
 */
export async function searchSquareProducts(query: string): Promise<Product[]> {
  if (!isSquareConfigured()) {
    throw new Error('Square API not configured');
  }
  
  try {
    const { catalogApi } = squareClient;
    const response = await catalogApi.listCatalog();
    
    if (!response.result?.objects) {
      return [];
    }
    
    const items = response.result.objects.filter((item: any) => item.type === 'ITEM');
    const allObjects = response.result.objects;
    
    // Client-side search filtering
    const queryLower = query.toLowerCase();
    const matchingItems = items.filter((item: any) => {
      const name = item.itemData?.name?.toLowerCase() || '';
      const description = item.itemData?.description?.toLowerCase() || '';
      return name.includes(queryLower) || description.includes(queryLower);
    });
    
    return matchingItems.map((item: any) => convertSquareItemToProduct(item, allObjects));
  } catch (error) {
    console.error('Error searching Square products:', error);
    return [];
  }
}
