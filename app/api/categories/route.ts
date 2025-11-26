import { getCategories } from '@/lib/square/catalog';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';

// Cache categories for 1 hour (they don't change often)
export const revalidate = 3600;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/categories
// Returns all categories from Square
export async function GET() {
  try {
    // Fetch categories from Square
    const categoryMap = await getCategories();
    
    // Convert map to array of { id, name } objects
    const categories = Array.from(categoryMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));

    return successResponse(
      {
        categories,
        categoryMap: Object.fromEntries(categoryMap), // Also return as object for easy lookup
      },
      {
        meta: {
          cached: true,
          total: categories.length,
        },
      }
    );
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

