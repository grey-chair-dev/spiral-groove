import { Product, SquareCatalogItem, SquareOrder } from '@/types';

// Square API configuration
const SQUARE_BASE_URL = process.env.SQUARE_ENVIRONMENT === 'production' 
  ? 'https://connect.squareup.com/v2' 
  : 'https://connect.squareupsandbox.com/v2';

const SQUARE_HEADERS = {
  'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2023-10-18'
};

// Cache configuration
const CACHE_TTL = 300; // 5 minutes

export class SquareService {
  /**
   * Get all products from Square catalog
   */
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${SQUARE_BASE_URL}/catalog/list?types=ITEM`, {
        headers: SQUARE_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`Square API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.objects) {
        return [];
      }

      const products: Product[] = [];

      for (const item of data.objects) {
        if (item.type === 'ITEM' && item.item_data?.variations) {
          for (const variation of item.item_data.variations) {
            if (variation.type === 'ITEM_VARIATION' && variation.item_variation_data) {
              const variationData = variation.item_variation_data;
              
              products.push({
                id: variation.id,
                name: item.item_data.name,
                description: item.item_data.description,
                price: variationData.price_money?.amount || 0,
                stock: variationData.track_inventory ? 
                  (await this.getInventoryCount(variation.id)) : 999,
                image: '', // Square doesn't provide images in catalog API
                condition: 'new', // Default to new, could be determined by category
                category: item.item_data.category_id,
                artist: this.extractArtistFromName(item.item_data.name),
                album: item.item_data.name,
              });
            }
          }
        }
      }

      return products;
    } catch (error) {
      console.error('Error fetching products from Square:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get inventory count for a specific item variation
   */
  static async getInventoryCount(variationId: string): Promise<number> {
    try {
      const response = await fetch(`${SQUARE_BASE_URL}/inventory/${variationId}`, {
        headers: SQUARE_HEADERS
      });
      
      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return parseInt(data.count || '0');
    } catch (error) {
      console.error('Error fetching inventory count:', error);
      return 0;
    }
  }

  /**
   * Create a checkout session
   */
  static async createCheckoutSession(
    lineItems: Array<{ id: string; quantity: number }>,
    redirectUrl: string
  ) {
    try {
      const checkoutRequest = {
        idempotency_key: crypto.randomUUID(),
        checkout_page_url: {
          url: redirectUrl,
        },
        order: {
          location_id: process.env.SQUARE_LOCATION_ID!,
          line_items: lineItems.map(item => ({
            catalog_object_id: item.id,
            quantity: item.quantity.toString(),
          })),
        },
        ask_for_shipping_address: true,
        merchant_support_email: process.env.SQUARE_MERCHANT_EMAIL,
      };

      const response = await fetch(`${SQUARE_BASE_URL}/checkout-sessions`, {
        method: 'POST',
        headers: SQUARE_HEADERS,
        body: JSON.stringify(checkoutRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Square API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        checkoutUrl: data.checkout_session?.checkout_page_url,
        sessionId: data.checkout_session?.id,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<SquareOrder | null> {
    try {
      const response = await fetch(`${SQUARE_BASE_URL}/orders/${orderId}`, {
        headers: SQUARE_HEADERS
      });
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.order as SquareOrder;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookUrl: string
  ): boolean {
    // Implementation for webhook signature verification
    // This would use Square's webhook signature verification
    return true; // Placeholder
  }

  /**
   * Extract artist name from product name
   */
  private static extractArtistFromName(name: string): string {
    // Simple extraction - assumes format "Artist - Album" or "Artist: Album"
    const match = name.match(/^([^-:]+)/);
    return match ? match[1].trim() : name;
  }
}

export default SquareService;
