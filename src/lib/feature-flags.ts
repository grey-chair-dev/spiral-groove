/**
 * Feature Flags Service
 * Controls feature availability based on environment variables
 */

export interface FeatureFlags {
  FEATURE_SQUARE_LIVE: boolean;
  FEATURE_NEWSLETTER_ACTIVE: boolean;
  FEATURE_CHECKOUT_ENABLED: boolean;
  FEATURE_EVENT_INQUIRIES: boolean;
  FEATURE_BLOG_ENABLED: boolean;
  FEATURE_LOYALTY_PROGRAM: boolean;
  FEATURE_IN_STORE_PICKUP: boolean;
  FEATURE_SOCIAL_INTEGRATION: boolean;
}

const defaultFlags: FeatureFlags = {
  FEATURE_SQUARE_LIVE: false,
  FEATURE_NEWSLETTER_ACTIVE: false,
  FEATURE_CHECKOUT_ENABLED: false,
  FEATURE_EVENT_INQUIRIES: true,
  FEATURE_BLOG_ENABLED: true,
  FEATURE_LOYALTY_PROGRAM: false,
  FEATURE_IN_STORE_PICKUP: false,
  FEATURE_SOCIAL_INTEGRATION: false,
};

/**
 * Get feature flag value
 */
export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
  const envValue = process.env[flag];
  
  if (envValue === undefined) {
    return defaultFlags[flag];
  }
  
  return envValue.toLowerCase() === 'true';
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): FeatureFlags {
  return {
    FEATURE_SQUARE_LIVE: getFeatureFlag('FEATURE_SQUARE_LIVE'),
    FEATURE_NEWSLETTER_ACTIVE: getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE'),
    FEATURE_CHECKOUT_ENABLED: getFeatureFlag('FEATURE_CHECKOUT_ENABLED'),
    FEATURE_EVENT_INQUIRIES: getFeatureFlag('FEATURE_EVENT_INQUIRIES'),
    FEATURE_BLOG_ENABLED: getFeatureFlag('FEATURE_BLOG_ENABLED'),
    FEATURE_LOYALTY_PROGRAM: getFeatureFlag('FEATURE_LOYALTY_PROGRAM'),
    FEATURE_IN_STORE_PICKUP: getFeatureFlag('FEATURE_IN_STORE_PICKUP'),
    FEATURE_SOCIAL_INTEGRATION: getFeatureFlag('FEATURE_SOCIAL_INTEGRATION'),
  };
}

/**
 * Check if feature is enabled (client-side safe)
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  if (typeof window === 'undefined') {
    return getFeatureFlag(flag);
  }
  
  // For client-side, we'll use a simple approach
  // In production, you might want to fetch from an API
  return getFeatureFlag(flag);
}

/**
 * Feature flag descriptions for documentation
 */
export const FEATURE_DESCRIPTIONS: Record<keyof FeatureFlags, string> = {
  FEATURE_SQUARE_LIVE: 'Enable live Square API integration (vs mock data)',
  FEATURE_NEWSLETTER_ACTIVE: 'Enable newsletter signup functionality',
  FEATURE_CHECKOUT_ENABLED: 'Enable checkout and payment processing',
  FEATURE_EVENT_INQUIRIES: 'Enable event space inquiry forms',
  FEATURE_BLOG_ENABLED: 'Enable blog/Groove Notes functionality',
  FEATURE_LOYALTY_PROGRAM: 'Enable loyalty program features',
  FEATURE_IN_STORE_PICKUP: 'Enable in-store pickup options',
  FEATURE_SOCIAL_INTEGRATION: 'Enable social media integrations',
};