import { getInventoryCounts } from '@/lib/square/inventory';
import { successResponse, badRequestResponse, errorResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { getQueryParams, getStringParam } from '@/lib/api/middleware';

// Cache for 5 minutes (inventory changes more frequently)
export const revalidate = 300;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/inventory
 * Get inventory counts for products (cached)
 * 
 * Query params:
 * - ids: comma-separated list of Square catalog object IDs (required)
 */
export async function GET(request: Request) {
  try {
    const searchParams = getQueryParams(request);
    const idsParam = getStringParam(searchParams, 'ids');

    if (!idsParam) {
      return badRequestResponse('ids parameter is required');
    }

    const ids = idsParam.split(',').filter(Boolean);

    if (ids.length === 0) {
      return badRequestResponse('At least one ID is required');
    }

    const inventory = await getInventoryCounts(ids);

    return successResponse(
      {
        inventory,
        count: inventory.length,
      },
      {
        meta: {
          cached: true,
          requestedIds: ids.length,
        },
      }
    );
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

