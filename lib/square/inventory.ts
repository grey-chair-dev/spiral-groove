import { getClient, requireSquareConfig } from './client';
import { ApiError } from '@/lib/api/errors';
import type { SquareInventoryCount } from '@/lib/types/square';
import * as crypto from 'crypto';

/**
 * Get inventory count for a single catalog object
 */
export async function getInventoryCount(
  catalogObjectId: string
): Promise<SquareInventoryCount[]> {
  requireSquareConfig();

  if (!catalogObjectId) {
    throw new ApiError('Catalog object ID is required', 400, 'MISSING_CATALOG_ID');
  }

  try {
    const client = getClient();
    const page = await client.inventory.batchGetCounts({
      catalogObjectIds: [catalogObjectId],
    });

    const counts: SquareInventoryCount[] = [];
    for await (const item of page) {
      counts.push(item as SquareInventoryCount);
    }

    return counts;
  } catch (error: any) {
    throw new ApiError(
      `Failed to get inventory count: ${error.message}`,
      500,
      'INVENTORY_GET_ERROR',
      { cause: error }
    );
  }
}

/**
 * Inventory change request
 */
export interface InventoryChange {
  catalogObjectId: string;
  quantity: string; // Positive to add, negative to subtract
  adjustmentType?: 'ADJUSTMENT' | 'PHYSICAL_COUNT';
}

/**
 * Batch update inventory counts
 */
export async function batchUpdateInventory(
  changes: InventoryChange[]
): Promise<any> {
  requireSquareConfig();

  if (!changes || changes.length === 0) {
    throw new ApiError('At least one inventory change is required', 400, 'MISSING_CHANGES');
  }

  try {
    const client = getClient();
    const response = await client.inventory.batchCreateChanges({
      idempotencyKey: crypto.randomUUID(),
      changes: changes.map(change => ({
        type: change.adjustmentType || 'ADJUSTMENT',
        adjustment: {
          catalogObjectId: change.catalogObjectId,
          quantity: change.quantity,
          fromState: 'NONE',
          toState: 'IN_STOCK',
        },
      })),
    });

    return response;
  } catch (error: any) {
    throw new ApiError(
      `Failed to update inventory: ${error.message}`,
      500,
      'INVENTORY_UPDATE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get inventory counts for multiple catalog objects
 */
export async function getInventoryCounts(
  catalogObjectIds: string[]
): Promise<SquareInventoryCount[]> {
  requireSquareConfig();

  if (!catalogObjectIds || catalogObjectIds.length === 0) {
    throw new ApiError('At least one catalog object ID is required', 400, 'MISSING_IDS');
  }

  try {
    const client = getClient();
    const page = await client.inventory.batchGetCounts({
      catalogObjectIds,
    });

    const counts: SquareInventoryCount[] = [];
    for await (const item of page) {
      counts.push(item as SquareInventoryCount);
    }

    return counts;
  } catch (error: any) {
    throw new ApiError(
      `Failed to get inventory counts: ${error.message}`,
      500,
      'INVENTORY_BATCH_GET_ERROR',
      { cause: error }
    );
  }
}

