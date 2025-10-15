/**
 * Feature Flags Configuration
 * Centralized feature flag management for Spiral Groove Records
 */

export interface FeatureFlags {
  ENABLE_SQUARE_INTEGRATION: boolean;
  ENABLE_EMAIL_SERVICE: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_SOCIAL_MEDIA: boolean;
  ENABLE_IMAGE_CDN: boolean;
  ENABLE_REDIS_CACHE: boolean;
  ENABLE_DEBUG: boolean;
  ENABLE_LOGGING: boolean;
}

/**
 * Get feature flag value from environment variables
 */
function getFeatureFlag(key: keyof FeatureFlags, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  
  if (value === undefined) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
}

/**
 * Feature flags configuration
 */
export const featureFlags: FeatureFlags = {
  ENABLE_SQUARE_INTEGRATION: getFeatureFlag('ENABLE_SQUARE_INTEGRATION', false),
  ENABLE_EMAIL_SERVICE: getFeatureFlag('ENABLE_EMAIL_SERVICE', false),
  ENABLE_ANALYTICS: getFeatureFlag('ENABLE_ANALYTICS', false),
  ENABLE_SOCIAL_MEDIA: getFeatureFlag('ENABLE_SOCIAL_MEDIA', false),
  ENABLE_IMAGE_CDN: getFeatureFlag('ENABLE_IMAGE_CDN', false),
  ENABLE_REDIS_CACHE: getFeatureFlag('ENABLE_REDIS_CACHE', false),
  ENABLE_DEBUG: getFeatureFlag('ENABLE_DEBUG', true),
  ENABLE_LOGGING: getFeatureFlag('ENABLE_LOGGING', true),
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  return Object.entries(featureFlags)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as keyof FeatureFlags);
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): (keyof FeatureFlags)[] {
  return Object.entries(featureFlags)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature as keyof FeatureFlags);
}

/**
 * Feature flag validation
 */
export function validateFeatureFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required environment variables for enabled features
  if (featureFlags.ENABLE_SQUARE_INTEGRATION) {
    const requiredVars = ['SQUARE_APPLICATION_ID', 'SQUARE_ACCESS_TOKEN'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName} (required for ENABLE_SQUARE_INTEGRATION)`);
      }
    }
  }
  
  if (featureFlags.ENABLE_EMAIL_SERVICE) {
    const emailService = process.env.EMAIL_SERVICE;
    if (!emailService) {
      errors.push('Missing EMAIL_SERVICE environment variable');
    } else if (emailService === 'resend' && !process.env.RESEND_API_KEY) {
      errors.push('Missing RESEND_API_KEY environment variable (required for Resend email service)');
    } else if (emailService === 'nodemailer') {
      const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          errors.push(`Missing required environment variable: ${varName} (required for Nodemailer)`);
        }
      }
    }
  }
  
  if (featureFlags.ENABLE_ANALYTICS) {
    if (!process.env.GOOGLE_ANALYTICS_ID && !process.env.MIXPANEL_TOKEN) {
      errors.push('At least one analytics service must be configured (GOOGLE_ANALYTICS_ID or MIXPANEL_TOKEN)');
    }
  }
  
  if (featureFlags.ENABLE_IMAGE_CDN) {
    const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName} (required for ENABLE_IMAGE_CDN)`);
      }
    }
  }
  
  if (featureFlags.ENABLE_REDIS_CACHE) {
    if (!process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
      errors.push('At least one cache service must be configured (REDIS_URL or KV_REST_API_URL)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log feature flags status (only in development)
 */
export function logFeatureFlagsStatus(): void {
  if (!featureFlags.ENABLE_DEBUG || !featureFlags.ENABLE_LOGGING) {
    return;
  }
  
  console.log('🚀 Feature Flags Status:');
  console.log('========================');
  
  const enabledFeatures = getEnabledFeatures();
  const disabledFeatures = getDisabledFeatures();
  
  if (enabledFeatures.length > 0) {
    console.log('✅ Enabled features:');
    enabledFeatures.forEach(feature => {
      console.log(`   - ${feature}`);
    });
  }
  
  if (disabledFeatures.length > 0) {
    console.log('❌ Disabled features:');
    disabledFeatures.forEach(feature => {
      console.log(`   - ${feature}`);
    });
  }
  
  console.log('========================\n');
}

/**
 * Runtime feature flag check with fallback
 */
export function withFeatureFlag<T>(
  feature: keyof FeatureFlags,
  enabledCallback: () => T,
  disabledCallback?: () => T
): T | undefined {
  if (isFeatureEnabled(feature)) {
    return enabledCallback();
  }
  
  if (disabledCallback) {
    return disabledCallback();
  }
  
  return undefined;
}

/**
 * Conditional feature flag wrapper for async functions
 */
export async function withFeatureFlagAsync<T>(
  feature: keyof FeatureFlags,
  enabledCallback: () => Promise<T>,
  disabledCallback?: () => Promise<T>
): Promise<T | undefined> {
  if (isFeatureEnabled(feature)) {
    return await enabledCallback();
  }
  
  if (disabledCallback) {
    return await disabledCallback();
  }
  
  return undefined;
}
