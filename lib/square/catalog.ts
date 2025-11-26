import { getClient, requireSquareConfig } from './client';
import { ApiError, NotFoundError } from '@/lib/api/errors';
import type { SquareCatalogObject } from '@/lib/types/square';

/**
 * Default pagination limit
 */
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/**
 * Search options for catalog items
 */
export interface SearchCatalogOptions {
  limit?: number;
  cursor?: string;
  query?: string;
  categoryId?: string; // Filter by category ID
  objectTypes?: ('ITEM' | 'CATEGORY' | 'DISCOUNT' | 'TAX' | 'MODIFIER_LIST' | 'MODIFIER')[];
}

/**
 * Search catalog items from Square
 */
export async function searchCatalogItems(
  options: SearchCatalogOptions = {}
): Promise<{
  objects?: SquareCatalogObject[];
  cursor?: string;
  relatedObjects?: any[];  // Categories and other related objects
}> {
  requireSquareConfig();

  const limit = Math.min(options.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const objectTypes = (options.objectTypes || ['ITEM']) as any;

  try {
    const client = getClient();
    
    // Build the query - Square supports filtering by category_id using exactQuery
    let query: any = undefined;
    if (options.query || options.categoryId) {
      // If we have both search and category, prioritize category filter
      // Square's API doesn't easily support combining both, so we filter by category first
      if (options.categoryId) {
        query = {
          exactQuery: {
            attributeName: 'category_id',
            attributeValue: options.categoryId,
          },
        };
      } else if (options.query) {
        query = {
          exactQuery: {
            attributeName: 'name',
            attributeValue: options.query,
          },
        };
      }
    }
    
    const response = await client.catalog.search({
      objectTypes,
      limit,
      query,
      cursor: options.cursor,
      includeRelatedObjects: true,  // Include categories in the response
    });

    return {
      objects: response.objects as SquareCatalogObject[] | undefined,
      cursor: response.cursor,
      relatedObjects: (response as any).relatedObjects,  // Categories might be in relatedObjects
    };
  } catch (error: any) {
    throw new ApiError(
      `Catalog search failed: ${error.message}`,
      500,
      'CATALOG_SEARCH_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get a single catalog item by Square ID
 * @throws {NotFoundError} if item not found
 */
export async function getCatalogItem(
  itemId: string
): Promise<{
  objects?: SquareCatalogObject[];
  relatedObjects?: any[];
}> {
  requireSquareConfig();

  if (!itemId) {
    throw new ApiError('Item ID is required', 400, 'MISSING_ITEM_ID');
  }

  try {
    const client = getClient();
    const response = await client.catalog.batchGet({
      objectIds: [itemId],
      includeRelatedObjects: true,
    });

    const objects = response.objects as SquareCatalogObject[] | undefined;
    
    if (!objects || objects.length === 0) {
      throw new NotFoundError(`Catalog item with ID ${itemId} not found`);
    }

    return { 
      objects,
      relatedObjects: (response as any).relatedObjects,
    };
  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw new ApiError(
      `Failed to get catalog item: ${error.message}`,
      500,
      'CATALOG_GET_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get all catalog items with automatic pagination
 * Fetches all pages until no more items are available
 */
export async function getAllCatalogItems(): Promise<SquareCatalogObject[]> {
  requireSquareConfig();

  const allItems: SquareCatalogObject[] = [];
  let cursor: string | undefined;

  do {
    const response = await searchCatalogItems({
      limit: DEFAULT_LIMIT,
      cursor,
    });

    if (response.objects) {
      allItems.push(...response.objects);
    }

    cursor = response.cursor;
  } while (cursor);

  return allItems;
}

/**
 * Get all categories from Square catalog
 * Returns a map of categoryId -> categoryName
 */
export async function getCategories(): Promise<Map<string, string>> {
  requireSquareConfig();

  const categoryMap = new Map<string, string>();
  let cursor: string | undefined;

  try {
    const client = getClient();
    
    do {
      const response = await client.catalog.search({
        objectTypes: ['CATEGORY'],
        limit: DEFAULT_LIMIT,
        cursor,
      });

      if (response.objects) {
        for (const obj of response.objects) {
          // Square categories have categoryData with name
          const categoryData = (obj as any).categoryData;
          if (categoryData?.name && obj.id) {
            categoryMap.set(obj.id, categoryData.name);
          }
        }
      }

      cursor = response.cursor;
    } while (cursor);
  } catch (error: any) {
    throw new ApiError(
      `Failed to fetch categories: ${error.message}`,
      500,
      'CATEGORIES_FETCH_ERROR',
      { cause: error }
    );
  }

  return categoryMap;
}

