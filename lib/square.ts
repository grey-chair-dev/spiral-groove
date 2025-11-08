// Square API Configuration
// Use string literals to avoid runtime issues with Environment enum
const getEnvironment = (): 'sandbox' | 'production' => {
  if (typeof process === 'undefined' || !process.env) {
    return 'sandbox'; // Default for client-side
  }
  return process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
};

const getSquareConfig = () => {
  if (typeof process === 'undefined' || !process.env) {
    // Client-side: return empty config
    return {
      accessToken: '',
      environment: 'sandbox' as any,
      applicationId: '',
      locationId: '',
      webhookSignatureKey: '',
    };
  }
  return {
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    environment: getEnvironment() as any,
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
  };
};

const squareConfig = getSquareConfig();

// Lazy-load Square client to avoid build-time errors
let _squareClient: any = null;

async function getSquareClient() {
  if (!_squareClient) {
    try {
      // Dynamic import to avoid build-time issues
      const square = await import('square');
      const { Client } = square;
      _squareClient = new Client(squareConfig);
    } catch (error) {
      console.error('Failed to initialize Square client:', error);
      throw new Error('Square SDK not available');
    }
  }
  return _squareClient;
}

// Export lazy-loaded client getter
// This proxy will only initialize the client when it's actually accessed
// Only works on server-side (Node.js)
export const squareClient = new Proxy({} as any, {
  get(_target, prop) {
    // Only initialize on server-side
    if (typeof window !== 'undefined') {
      // Client-side: return no-op
      return () => {};
    }
    
    // For synchronous access, we need to handle it differently
    // Since dynamic import is async, we'll use a synchronous require as fallback
    if (!_squareClient) {
      try {
        // Use require for synchronous loading (works in Node.js only)
        const square = require('square');
        // Try different export patterns
        const Client = square.Client || square.default?.Client || square.default || square;
        
        if (typeof Client !== 'function') {
          throw new Error('Square Client is not a constructor');
        }
        
        _squareClient = new Client(squareConfig);
      } catch (error) {
        console.error('Failed to initialize Square client:', error);
        // Return a no-op object to prevent crashes during build
        return () => {};
      }
    }
    return _squareClient[prop];
  }
});

// Export configuration for use in other files
export { squareConfig };

// Types for Square integration
export interface SquareConfig {
  accessToken: string;
  environment: 'sandbox' | 'production';
  applicationId: string;
  locationId: string;
  webhookSignatureKey: string;
}

export interface SquareProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
  quantity?: number;
}

export interface SquareOrder {
  id: string;
  lineItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Helper function to check if Square is configured
// Safe for both client and server-side use
export function isSquareConfigured(): boolean {
  // On client-side, always return false (Square API is server-only)
  if (typeof window !== 'undefined') {
    return false;
  }
  
  // Server-side: check environment variables
  const config = getSquareConfig();
  return !!(
    config.accessToken &&
    config.applicationId &&
    config.locationId
  );
}

// Helper function to get environment-specific URLs
export function getSquareEnvironmentUrls() {
  const isProduction = squareConfig.environment === 'production';
  
  return {
    apiUrl: isProduction 
      ? 'https://connect.squareup.com/v2' 
      : 'https://connect.squareupsandbox.com/v2',
    webUrl: isProduction 
      ? 'https://squareup.com' 
      : 'https://squareupsandbox.com',
  };
}
