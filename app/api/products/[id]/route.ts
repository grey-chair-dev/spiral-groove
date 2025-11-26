import { getCatalogItem, getCategories } from '@/lib/square/catalog';
import { getInventoryCounts } from '@/lib/square/inventory';
import { formatProduct } from '@/lib/utils/products';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';

// Cache for 1 hour
export const revalidate = 3600;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/products/[id]
// Get a single product by its Square ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return notFoundResponse('Product ID is required');
    }

    // Fetch categories to map IDs to names
    const categoryMap = await getCategories();

    // Fetch from Square
    const result = await getCatalogItem(id);
    const product = result.objects?.[0];

    if (!product) {
      return notFoundResponse('Product not found');
    }

    // If categories are in relatedObjects, add them to the map
    if (result.relatedObjects) {
      for (const obj of result.relatedObjects) {
        if (obj.type === 'CATEGORY' && (obj as any).categoryData?.name) {
          categoryMap.set(obj.id, (obj as any).categoryData.name);
        }
      }
    }

    // Fetch inventory counts for product variations
    const inventoryMap = new Map<string, number>();
    try {
      const variations = product?.itemData?.variations || [];
      const variationIds = variations.map(v => v.id).filter(Boolean);
      
      if (variationIds.length > 0) {
        const inventoryCounts = await getInventoryCounts(variationIds);
        for (const count of inventoryCounts) {
          if (count.catalogObjectId && count.quantity) {
            const currentCount = inventoryMap.get(count.catalogObjectId) || 0;
            inventoryMap.set(count.catalogObjectId, currentCount + Number(count.quantity));
          }
        }
      }
    } catch (error) {
      // If inventory fetch fails, continue without stock counts
      console.error('Failed to fetch inventory:', error);
    }

    // Format it for our API response
    // Pass relatedObjects and inventoryMap so images and stock can be extracted
    const formatted = formatProduct(product, categoryMap, result.relatedObjects, inventoryMap);

    return successResponse(formatted, {
      meta: {
        cached: true,
      },
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}
