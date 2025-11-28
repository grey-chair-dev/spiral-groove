export type ECSProvider = 'square' | 'shopify';

export interface ECSCatalogAPI {
  search: (params: any) => Promise<any>;
  batchGet: (params: any) => Promise<any>;
}

export interface ECSOrdersAPI {
  create: (params: any) => Promise<any>;
  batchGet: (params: any) => Promise<any>;
  search: (params: any) => Promise<any>;
}

export interface ECSInventoryAPI {
  batchGetCounts: (params: any) => Promise<any>;
  batchCreateChanges: (params: any) => Promise<any>;
}

export interface ECSCheckoutAPI {
  paymentLinks: {
    create: (params: any) => Promise<any>;
  };
}

export interface ECSWebhookAPI {
  processPayload: (type: string, data: any) => Promise<void>;
}

export interface ECSClient {
  provider: ECSProvider;
  catalog: ECSCatalogAPI;
  orders: ECSOrdersAPI;
  inventory: ECSInventoryAPI;
  checkout: ECSCheckoutAPI;
  webhooks: ECSWebhookAPI;
  getLocationId: () => string | undefined;
}

