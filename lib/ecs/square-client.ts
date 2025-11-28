import type { ECSClient } from './types';

const notImplemented = (method: string) => {
  throw new Error(
    `[Square Integration] The method "${method}" is not implemented. ` +
    'Update lib/ecs/square-client.ts to connect Local Commerce Template to your Square account.'
  );
};

export default function createSquareClient(): ECSClient {
  const locationId = process.env.ECS_LOCATION_ID;

  return {
    provider: 'square',
    catalog: {
      search: async (_params: any) => notImplemented('catalog.search'),
      batchGet: async (_params: any) => notImplemented('catalog.batchGet'),
    },
    orders: {
      create: async (_params: any) => notImplemented('orders.create'),
      batchGet: async (_params: any) => notImplemented('orders.batchGet'),
      search: async (_params: any) => notImplemented('orders.search'),
    },
    inventory: {
      batchGetCounts: async (_params: any) => notImplemented('inventory.batchGetCounts'),
      batchCreateChanges: async (_params: any) => notImplemented('inventory.batchCreateChanges'),
    },
    checkout: {
      paymentLinks: {
        create: async (_params: any) => notImplemented('checkout.paymentLinks.create'),
      },
    },
    webhooks: {
      processPayload: async (type: string, data: any) => {
        console.info('[Square webhook placeholder]', { type, data });
      },
    },
    getLocationId: () => locationId,
  };
}

