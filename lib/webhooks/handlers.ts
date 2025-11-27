import { revalidateTag } from 'next/cache';
import { getClient } from '@/lib/square/client';
import { searchCatalogItems } from '@/lib/square/catalog';
import { withSquareRetry } from '@/lib/utils/retry';

const WEBHOOK_LOG_PREFIX = '[SquareWebhookWorker]';

export const logInfo = (message: string, context: Record<string, unknown> = {}) => {
  console.info(WEBHOOK_LOG_PREFIX, message, context);
};

export async function handleWebhookEvent(type: string, data: any) {
  switch (type) {
    case 'order.created':
    case 'order.updated':
    case 'order.fulfillment.updated':
      return handleOrderEvent(type, data);

    case 'payment.created':
    case 'payment.updated':
      return handlePaymentEvent(type, data);

    case 'refund.created':
    case 'refund.updated':
      return handleRefundEvent(type, data);

    case 'customer.created':
    case 'customer.updated':
    case 'customer.deleted':
      return handleCustomerEvent(type, data);

    case 'inventory.count.updated':
      return handleInventoryCountUpdated(data);

    case 'catalog.version.updated':
      return handleCatalogVersionUpdated(data);

    case 'loyalty.account.created':
    case 'loyalty.account.updated':
    case 'loyalty.account.deleted':
    case 'loyalty.event.created':
    case 'loyalty.program.created':
    case 'loyalty.program.updated':
    case 'loyalty.promotion.created':
    case 'loyalty.promotion.updated':
      return handleLoyaltyEvent(type);

    default:
      logInfo('Unhandled event type', { type });
  }
}

async function handleOrderEvent(type: string, data: any) {
  const orderId = extractTopLevelId(data);
  logInfo(type, { orderId });
  revalidateTag('products');
  revalidateTag('inventory');
}

async function handlePaymentEvent(type: string, data: any) {
  logInfo(type, { paymentId: extractTopLevelId(data) });
}

async function handleRefundEvent(type: string, data: any) {
  logInfo(type, { refundId: extractTopLevelId(data) });
}

async function handleCustomerEvent(type: string, data: any) {
  logInfo(type, { customerId: extractTopLevelId(data) });
}

async function handleInventoryCountUpdated(data: any) {
  const catalogObjectId = extractTopLevelId(data);
  logInfo('inventory.count.updated', { catalogObjectId });
  await refreshInventorySnapshot(catalogObjectId);
}

async function handleCatalogVersionUpdated(data: any) {
  logInfo('catalog.version.updated', { catalogVersion: data?.object?.catalog_version });
  await refreshCatalogSnapshot();
}

async function handleLoyaltyEvent(type: string) {
  logInfo('loyalty.event', { type });
}

function extractTopLevelId(data: any): string | undefined {
  return data?.object?.id ?? data?.id ?? data?.object?.order_id;
}

async function refreshInventorySnapshot(catalogObjectId?: string) {
  if (!catalogObjectId) {
    revalidateTag('inventory');
    return;
  }

  try {
    await withSquareRetry(() =>
      getClient().inventory.batchGetCounts({ catalogObjectIds: [catalogObjectId] })
    );
  } catch (error: any) {
    logInfo('inventory refresh failed', {
      catalogObjectId,
      error: error?.message || String(error),
    });
  } finally {
    revalidateTag('inventory');
  }
}

async function refreshCatalogSnapshot() {
  try {
    await withSquareRetry(() =>
      searchCatalogItems({ limit: 1 })
    );
  } catch (error: any) {
    logInfo('catalog refresh failed', {
      error: error?.message || String(error),
    });
  } finally {
    revalidateTag('products');
  }
}

