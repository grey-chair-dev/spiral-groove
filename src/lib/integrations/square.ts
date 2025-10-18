/**
 * Mock Square Integration
 * Simulates Square API responses for development and testing
 */

import { getFeatureFlag } from '@/lib/feature-flags';
import { mockProducts, getProductById, getProductsByGenre, getNewArrivals, type Product } from '@/lib/mock-data';

export interface SquareCatalogItem {
  id: string;
  type: 'ITEM';
  item_data: {
    name: string;
    description?: string;
    category_id?: string;
    variations: SquareVariation[];
  };
}

export interface SquareVariation {
  id: string;
  type: 'ITEM_VARIATION';
  item_variation_data: {
    item_id: string;
    name: string;
    pricing_type: 'FIXED_PRICING';
    price_money: {
      amount: number;
      currency: string;
    };
    track_inventory: boolean;
    inventory_alert_type: 'LOW_QUANTITY';
    inventory_alert_threshold: number;
  };
}

export interface SquareInventoryCount {
  catalog_object_id: string;
  state: 'IN_STOCK' | 'SOLD_OUT';
  location_id: string;
  quantity: string;
  calculated_at: string;
}

export interface SquareCheckoutLink {
  id: string;
  checkout_url: string;
  order_id: string;
  created_at: string;
}

export interface SquareOrder {
  id: string;
  location_id: string;
  line_items: SquareLineItem[];
  total_money: {
    amount: number;
    currency: string;
  };
  created_at: string;
}

export interface SquareLineItem {
  uid: string;
  catalog_object_id: string;
  name: string;
  quantity: string;
  base_price_money: {
    amount: number;
    currency: string;
  };
  total_money: {
    amount: number;
    currency: string;
  };
}

class MockSquareClient {
  private baseUrl = 'https://connect.squareup.com/v2';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // In a real implementation, this would make actual HTTP requests
    // For now, we'll return mock data based on the endpoint
    return this.getMockResponse<T>(endpoint);
  }

  private getMockResponse<T>(endpoint: string): T {
    if (endpoint.includes('/catalog/search')) {
      return this.getMockCatalogSearch() as T;
    }
    
    if (endpoint.includes('/catalog/object/')) {
      return this.getMockCatalogObject() as T;
    }
    
    if (endpoint.includes('/inventory/counts')) {
      return this.getMockInventoryCounts() as T;
    }
    
    if (endpoint.includes('/checkout/links')) {
      return this.getMockCheckoutLink() as T;
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }

  private getMockCatalogSearch() {
    return {
      objects: mockProducts.map(product => this.convertProductToSquareItem(product)),
      cursor: 'mock-cursor-123'
    };
  }

  private getMockCatalogObject() {
    return {
      object: this.convertProductToSquareItem(mockProducts[0])
    };
  }

  private getMockInventoryCounts() {
    return {
      counts: mockProducts.map(product => ({
        catalog_object_id: product.id,
        state: product.in_stock ? 'IN_STOCK' : 'SOLD_OUT' as const,
        location_id: 'mock-location-123',
        quantity: product.quantity?.toString() || '0',
        calculated_at: new Date().toISOString()
      }))
    };
  }

  private getMockCheckoutLink() {
    return {
      checkout_link: {
        id: 'mock-checkout-123',
        checkout_url: 'https://checkout.square.site/mock-checkout-123',
        order_id: 'mock-order-123',
        created_at: new Date().toISOString()
      }
    };
  }

  private convertProductToSquareItem(product: Product): SquareCatalogItem {
    return {
      id: product.id,
      type: 'ITEM',
      item_data: {
        name: `${product.artist} - ${product.title}`,
        description: product.description,
        category_id: product.genre.toLowerCase().replace(/\s+/g, '-'),
        variations: [{
          id: `${product.id}-variation`,
          type: 'ITEM_VARIATION',
          item_variation_data: {
            item_id: product.id,
            name: `${product.condition} - ${product.format}`,
            pricing_type: 'FIXED_PRICING',
            price_money: {
              amount: product.price,
              currency: product.currency
            },
            track_inventory: true,
            inventory_alert_type: 'LOW_QUANTITY',
            inventory_alert_threshold: 2
          }
        }]
      }
    };
  }

  // Public API methods
  async searchCatalog(query?: string, filters?: Record<string, string>) {
    if (!getFeatureFlag('FEATURE_SQUARE_LIVE')) {
      // Return mock data
      let products = mockProducts;
      
      if (query) {
        products = products.filter(p => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.artist.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      if (filters?.genre) {
        products = getProductsByGenre(filters.genre);
      }
      
      return {
        objects: products.map(p => this.convertProductToSquareItem(p)),
        cursor: 'mock-cursor'
      };
    }

    // Real Square API call would go here
    return this.makeRequest('/catalog/search', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          text_query: {
            keywords: query
          },
          exact_query: {
            attribute_name: 'category_id',
            attribute_value: filters?.genre
          }
        }
      })
    });
  }

  async getCatalogObject(objectId: string) {
    if (!getFeatureFlag('FEATURE_SQUARE_LIVE')) {
      const product = getProductById(objectId);
      if (!product) {
        throw new Error('Product not found');
      }
      return { object: this.convertProductToSquareItem(product) };
    }

    return this.makeRequest(`/catalog/object/${objectId}`);
  }

  async getInventoryCounts(catalogObjectIds?: string[]) {
    if (!getFeatureFlag('FEATURE_SQUARE_LIVE')) {
      const products = catalogObjectIds 
        ? mockProducts.filter(p => catalogObjectIds.includes(p.id))
        : mockProducts;
      
      return {
        counts: products.map(product => ({
          catalog_object_id: product.id,
          state: product.in_stock ? 'IN_STOCK' : 'SOLD_OUT' as const,
          location_id: 'mock-location-123',
          quantity: product.quantity?.toString() || '0',
          calculated_at: new Date().toISOString()
        }))
      };
    }

    return this.makeRequest('/inventory/counts', {
      method: 'POST',
      body: JSON.stringify({
        catalog_object_ids: catalogObjectIds
      })
    });
  }

  async createCheckoutLink(lineItems: Array<{catalog_object_id: string, quantity: number}>) {
    if (!getFeatureFlag('FEATURE_SQUARE_LIVE')) {
      // Generate mock checkout URL
      const checkoutId = `mock-checkout-${Date.now()}`;
      return {
        checkout_link: {
          id: checkoutId,
          checkout_url: `https://checkout.square.site/${checkoutId}`,
          order_id: `mock-order-${Date.now()}`,
          created_at: new Date().toISOString()
        }
      };
    }

    return this.makeRequest('/checkout/links', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: `checkout-${Date.now()}`,
        checkout: {
          line_items: lineItems.map(item => ({
            name: `Product ${item.catalog_object_id}`,
            quantity: item.quantity.toString(),
            base_price_money: {
              amount: 1000, // Mock price
              currency: 'USD'
            }
          }))
        }
      })
    });
  }

  async getNewArrivals(days: number = 14) {
    if (!getFeatureFlag('FEATURE_SQUARE_LIVE')) {
      const newArrivals = getNewArrivals(days);
      return {
        objects: newArrivals.map(p => this.convertProductToSquareItem(p)),
        cursor: 'mock-new-arrivals-cursor'
      };
    }

    // Real implementation would filter by creation date
    return this.searchCatalog();
  }
}

// Export singleton instance
export const squareClient = new MockSquareClient(
  process.env.SQUARE_ACCESS_TOKEN || 'mock-token'
);

// Helper functions for easier usage
export async function searchProducts(query?: string, filters?: Record<string, string>) {
  const response = await squareClient.searchCatalog(query, filters);
  return response.objects;
}

export async function getProduct(catalogObjectId: string) {
  const response = await squareClient.getCatalogObject(catalogObjectId);
  return response.object;
}

export async function getInventoryCounts(catalogObjectIds?: string[]) {
  const response = await squareClient.getInventoryCounts(catalogObjectIds);
  return response.counts;
}

export async function createCheckoutLink(lineItems: Array<{catalog_object_id: string, quantity: number}>) {
  const response = await squareClient.createCheckoutLink(lineItems);
  return response.checkout_link;
}

export async function getNewArrivals(days: number = 14) {
  const response = await squareClient.getNewArrivals(days);
  return response.objects;
}