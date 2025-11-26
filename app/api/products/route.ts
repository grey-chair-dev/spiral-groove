import { searchCatalogItems, getCategories } from '@/lib/square/catalog';
import { getInventoryCounts } from '@/lib/square/inventory';
import { formatProducts } from '@/lib/utils/products';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { getQueryParams, getIntParam, getStringParam } from '@/lib/api/middleware';

// Cache products for 1 hour - inventory changes more often but products are pretty stable
export const revalidate = 3600;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/products
// Returns products from Square with optional search and pagination
export async function GET(request: Request) {
  try {
    const searchParams = getQueryParams(request);
    const limit = getIntParam(searchParams, 'limit', 100);
    const search = getStringParam(searchParams, 'search');
    const cursor = getStringParam(searchParams, 'cursor');
    const categoryId = getStringParam(searchParams, 'categoryId'); // Filter by category ID

    // Fetch categories to map IDs to names
    const categoryMap = await getCategories();

    // If filtering by category, we need to find the category ID from the category name
    let filterCategoryId: string | undefined;
    if (categoryId) {
      // categoryId might be a name, try to find the ID
      for (const [id, name] of categoryMap.entries()) {
        if (name.toLowerCase() === categoryId.toLowerCase() || id === categoryId) {
          filterCategoryId = id;
          break;
        }
      }
      // If we couldn't find it, the categoryId might already be an ID, use it directly
      if (!filterCategoryId) {
        filterCategoryId = categoryId;
      }
    }

    // Fetch from Square (Next.js will cache this automatically)
    const result = await searchCatalogItems({
      limit,
      query: search,
      cursor,
      categoryId: filterCategoryId, // Pass category ID to filter
    });

    const rawProducts = result.objects || [];
    
    // If categories are in relatedObjects, add them to the map
    if (result.relatedObjects) {
      for (const obj of result.relatedObjects) {
        if (obj.type === 'CATEGORY' && (obj as any).categoryData?.name) {
          categoryMap.set(obj.id, (obj as any).categoryData.name);
        }
      }
    }
    
    // Fetch inventory counts for all product variations
    const inventoryMap = new Map<string, number>();
    try {
      // Collect all variation IDs from products
      const variationIds: string[] = [];
      for (const product of rawProducts) {
        const variations = product?.itemData?.variations || [];
        for (const variation of variations) {
          if (variation.id) {
            variationIds.push(variation.id);
          }
        }
      }
      
      // Fetch inventory in batches (Square API has limits)
      if (variationIds.length > 0) {
        const batchSize = 100; // Square's limit
        for (let i = 0; i < variationIds.length; i += batchSize) {
          const batch = variationIds.slice(i, i + batchSize);
          const inventoryCounts = await getInventoryCounts(batch);
          
          // Map inventory counts to variation IDs
          for (const count of inventoryCounts) {
            if (count.catalogObjectId && count.quantity) {
              const currentCount = inventoryMap.get(count.catalogObjectId) || 0;
              inventoryMap.set(count.catalogObjectId, currentCount + Number(count.quantity));
            }
          }
        }
      }
    } catch (error) {
      // If inventory fetch fails, continue without stock counts
      console.error('Failed to fetch inventory:', error);
    }
    
    // Pass relatedObjects and inventoryMap to formatProducts
    const formattedProducts = formatProducts(rawProducts, categoryMap, result.relatedObjects, inventoryMap);

    return successResponse(
      {
        products: formattedProducts,
        total: formattedProducts.length,
        cursor: result.cursor,  // For pagination
      },
      {
        meta: {
          cached: true,
          limit,
          hasMore: !!result.cursor,  // Let the client know if there are more results
        },
      }
    );
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

