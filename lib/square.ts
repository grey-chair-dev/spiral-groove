import { Client, Environment } from 'squareup';

// Square API Configuration
const squareConfig = {
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: (process.env.SQUARE_ENVIRONMENT as Environment) || Environment.Sandbox,
  applicationId: process.env.SQUARE_APPLICATION_ID!,
  locationId: process.env.SQUARE_LOCATION_ID!,
  webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
};

// Initialize Square client
export const squareClient = new Client(squareConfig);

// Export configuration for use in other files
export const squareConfig as SquareConfig;

// Types for Square integration
export interface SquareConfig {
  accessToken: string;
  environment: Environment;
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
export function isSquareConfigured(): boolean {
  return !!(
    squareConfig.accessToken &&
    squareConfig.applicationId &&
    squareConfig.locationId
  );
}

// Helper function to get environment-specific URLs
export function getSquareEnvironmentUrls() {
  const isProduction = squareConfig.environment === Environment.Production;
  
  return {
    apiUrl: isProduction 
      ? 'https://connect.squareup.com/v2' 
      : 'https://connect.squareupsandbox.com/v2',
    webUrl: isProduction 
      ? 'https://squareup.com' 
      : 'https://squareupsandbox.com',
  };
}
