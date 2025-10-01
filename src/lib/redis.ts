import { Product } from '@/types';

// Only initialize Redis if environment variables are provided
let redis: any = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn('Redis not available:', error);
  }
}

export class CacheService {
  private static CACHE_KEYS = {
    PRODUCTS: 'products:all',
    PRODUCT: (id: string) => `product:${id}`,
    INVENTORY: (id: string) => `inventory:${id}`,
  };

  private static CACHE_TTL = {
    PRODUCTS: 300, // 5 minutes
    PRODUCT: 600, // 10 minutes
    INVENTORY: 60, // 1 minute
  };

  /**
   * Cache products list
   */
  static async cacheProducts(products: Product[]): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.setex(
        this.CACHE_KEYS.PRODUCTS,
        this.CACHE_TTL.PRODUCTS,
        JSON.stringify(products)
      );
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }

  /**
   * Get cached products
   */
  static async getCachedProducts(): Promise<Product[] | null> {
    if (!redis) return null;
    
    try {
      const cached = await redis.get(this.CACHE_KEYS.PRODUCTS);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Error getting cached products:', error);
      return null;
    }
  }

  /**
   * Cache individual product
   */
  static async cacheProduct(product: Product): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.setex(
        this.CACHE_KEYS.PRODUCT(product.id),
        this.CACHE_TTL.PRODUCT,
        JSON.stringify(product)
      );
    } catch (error) {
      console.error('Error caching product:', error);
    }
  }

  /**
   * Get cached product
   */
  static async getCachedProduct(id: string): Promise<Product | null> {
    if (!redis) return null;
    
    try {
      const cached = await redis.get(this.CACHE_KEYS.PRODUCT(id));
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Error getting cached product:', error);
      return null;
    }
  }

  /**
   * Cache inventory count
   */
  static async cacheInventoryCount(productId: string, count: number): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.setex(
        this.CACHE_KEYS.INVENTORY(productId),
        this.CACHE_TTL.INVENTORY,
        count.toString()
      );
    } catch (error) {
      console.error('Error caching inventory count:', error);
    }
  }

  /**
   * Get cached inventory count
   */
  static async getCachedInventoryCount(productId: string): Promise<number | null> {
    if (!redis) return null;
    
    try {
      const cached = await redis.get(this.CACHE_KEYS.INVENTORY(productId));
      return cached ? parseInt(cached as string) : null;
    } catch (error) {
      console.error('Error getting cached inventory count:', error);
      return null;
    }
  }

  /**
   * Invalidate products cache
   */
  static async invalidateProductsCache(): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.del(this.CACHE_KEYS.PRODUCTS);
    } catch (error) {
      console.error('Error invalidating products cache:', error);
    }
  }

  /**
   * Invalidate product cache
   */
  static async invalidateProductCache(productId: string): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.del(this.CACHE_KEYS.PRODUCT(productId));
    } catch (error) {
      console.error('Error invalidating product cache:', error);
    }
  }

  /**
   * Invalidate inventory cache
   */
  static async invalidateInventoryCache(productId: string): Promise<void> {
    if (!redis) return;
    
    try {
      await redis.del(this.CACHE_KEYS.INVENTORY(productId));
    } catch (error) {
      console.error('Error invalidating inventory cache:', error);
    }
  }
}

export default CacheService;
