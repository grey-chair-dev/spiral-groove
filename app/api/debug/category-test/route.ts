import { getClient, requireSquareConfig } from '@/lib/square/client';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/debug/category-test
// Debug endpoint to see what category data Square is returning
export async function GET() {
  try {
    requireSquareConfig();
    const client = getClient();

    // Fetch a few products
    const productsResponse = await client.catalog.search({
      objectTypes: ['ITEM'],
      limit: 5,
      includeRelatedObjects: true,
    });

    // Fetch categories
    const categoriesResponse = await client.catalog.search({
      objectTypes: ['CATEGORY'],
      limit: 100,
    });

    return successResponse({
      products: productsResponse.objects?.map((obj: any) => ({
        id: obj.id,
        name: obj.itemData?.name,
        categoryId: obj.itemData?.categoryId,
        hasCategoryId: !!obj.itemData?.categoryId,
        itemDataKeys: Object.keys(obj.itemData || {}),
        fullItemData: obj.itemData,
      })),
      relatedObjects: (productsResponse as any).relatedObjects?.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        hasCategoryData: !!obj.categoryData,
        categoryData: obj.categoryData,
      })),
      categories: categoriesResponse.objects?.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        categoryData: obj.categoryData,
        name: obj.categoryData?.name,
      })),
      rawProductsResponse: productsResponse,
      rawCategoriesResponse: categoriesResponse,
    });
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

