// Type definitions for Square SDK
// The official 'square' package should have its own types, but we provide minimal
// type definitions here for the parts we use if needed

declare module 'square' {
  export enum Environment {
    Sandbox = 'sandbox',
    Production = 'production'
  }

  export class Client {
    constructor(config: {
      accessToken: string;
      environment: Environment;
      applicationId?: string;
      locationId?: string;
      webhookSignatureKey?: string;
    });
    
    catalogApi: {
      listCatalog(cursor?: string, types?: string): Promise<{ result?: { objects?: any[]; cursor?: string } }>;
      retrieveCatalogObject(objectId: string, includeRelatedObjects?: boolean): Promise<{ result?: { object?: any } }>;
      searchCatalogObjects(request: any): Promise<{ result?: { objects?: any[] } }>;
    };
    
    ordersApi: {
      createOrder(request: any): Promise<{ result?: { order?: any } }>;
      searchOrders(request: any): Promise<{ result?: { orders?: any[] } }>;
    };
    
    paymentsApi: {
      createPayment(request: any): Promise<{ result?: { payment?: any } }>;
      getPayment(paymentId: string): Promise<{ result?: { payment?: any } }>;
      listPayments(request: any): Promise<{ result?: { payments?: any[] } }>;
    };
    
    inventoryApi: {
      batchRetrieveInventoryCounts(request: any): Promise<{ result?: { counts?: any[] } }>;
    };
  }
}
