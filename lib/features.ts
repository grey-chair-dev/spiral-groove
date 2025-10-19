/**
 * Feature flags for Spiral Groove Records
 * Controls Square POS integration and related features
 * Environment variables override hardcoded defaults
 */

export const features = {
  // Square POS Integration
  ENABLE_SQUARE_SYNC: process.env.ENABLE_SQUARE_SYNC === 'true',
  ENABLE_REAL_TIME_INVENTORY: process.env.ENABLE_REAL_TIME_INVENTORY === 'true',
  ENABLE_NEW_ARRIVALS: process.env.ENABLE_NEW_ARRIVALS === 'true',
  
  // Future features
  ENABLE_BOPIS: process.env.ENABLE_BOPIS === 'true', // Buy Online, Pickup In Store
  ENABLE_LOCAL_DELIVERY: process.env.ENABLE_LOCAL_DELIVERY === 'true',
  ENABLE_LOYALTY_PROGRAM: process.env.ENABLE_LOYALTY_PROGRAM === 'true',
  ENABLE_EVENT_BOOKING: process.env.ENABLE_EVENT_BOOKING === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
}

/**
 * Check if Square is properly configured with credentials
 */
export function isSquareConfigured(): boolean {
  return !!(
    process.env.SQUARE_ACCESS_TOKEN &&
    process.env.SQUARE_APPLICATION_ID &&
    process.env.SQUARE_LOCATION_ID
  );
}
