# Feature Flags Documentation

## Overview

The Spiral Groove Records application uses a comprehensive feature flag system to enable/disable integrations and features without code changes. This allows for gradual rollouts, A/B testing, and easy maintenance.

## Configuration

Feature flags are configured via environment variables and managed through the `/src/lib/feature-flags.ts` module.

### Environment Variables

```env
# Feature Flags
ENABLE_SQUARE_INTEGRATION="false"
ENABLE_EMAIL_SERVICE="false"
ENABLE_ANALYTICS="false"
ENABLE_SOCIAL_MEDIA="false"
ENABLE_IMAGE_CDN="false"
ENABLE_REDIS_CACHE="false"
ENABLE_DEBUG="true"
ENABLE_LOGGING="true"
```

## Available Feature Flags

### ENABLE_SQUARE_INTEGRATION

**Purpose**: Controls Square POS and Payments integration

**Default**: `false`

**Dependencies**:
- `SQUARE_APPLICATION_ID`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_ENVIRONMENT`

**Features Enabled**:
- Product catalog sync with Square
- Real-time inventory updates
- Payment processing through Square
- Order creation in Square POS
- Webhook handling for Square events

**Usage**:
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

if (isFeatureEnabled('ENABLE_SQUARE_INTEGRATION')) {
  // Square integration code
  await squareClient.getProducts();
}
```

**API Impact**:
- `/api/products` - Syncs with Square catalog
- `/api/orders` - Creates orders in Square
- `/api/webhooks/square` - Handles Square webhooks

### ENABLE_EMAIL_SERVICE

**Purpose**: Controls email notification system

**Default**: `false`

**Dependencies**:
- `EMAIL_SERVICE` (resend or nodemailer)
- `RESEND_API_KEY` (if using Resend)
- `SMTP_*` variables (if using Nodemailer)

**Features Enabled**:
- Order confirmation emails
- Event inquiry confirmations
- Newsletter subscriptions
- Password reset emails
- Admin notifications

**Usage**:
```typescript
import { emailClient } from '@/lib/integrations/email';

await emailClient.sendOrderConfirmation({
  id: 'order_123',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  total: 25.99,
  items: [...]
});
```

**Email Templates**:
- Order confirmation
- Event inquiry confirmation
- Newsletter welcome
- Password reset
- Admin alerts

### ENABLE_ANALYTICS

**Purpose**: Controls analytics and tracking

**Default**: `false`

**Dependencies**:
- `GOOGLE_ANALYTICS_ID` or `MIXPANEL_TOKEN`

**Features Enabled**:
- Google Analytics 4 tracking
- Mixpanel event tracking
- E-commerce tracking
- Custom event tracking
- User behavior analytics

**Usage**:
```typescript
import { analyticsClient } from '@/lib/integrations/analytics';

await analyticsClient.trackEvent({
  name: 'product_view',
  properties: {
    product_id: 'prod_123',
    product_name: 'Pink Floyd - Dark Side of the Moon',
    category: 'Rock'
  }
});
```

**Tracked Events**:
- Page views
- Product views
- Add to cart
- Purchase completion
- Event inquiries
- User registrations

### ENABLE_SOCIAL_MEDIA

**Purpose**: Controls social media integrations

**Default**: `false`

**Dependencies**:
- `INSTAGRAM_ACCESS_TOKEN`
- `TIKTOK_ACCESS_TOKEN`

**Features Enabled**:
- Instagram feed display
- TikTok video embeds
- Social media sharing
- Social login (future)

**Usage**:
```typescript
import { socialMediaClient } from '@/lib/integrations/social';

if (isFeatureEnabled('ENABLE_SOCIAL_MEDIA')) {
  const instagramPosts = await socialMediaClient.getInstagramPosts();
}
```

### ENABLE_IMAGE_CDN

**Purpose**: Controls Cloudinary image CDN

**Default**: `false`

**Dependencies**:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Features Enabled**:
- Image upload to Cloudinary
- Automatic image optimization
- WebP conversion
- Responsive image delivery
- Image transformations

**Usage**:
```typescript
import { imageClient } from '@/lib/integrations/cloudinary';

if (isFeatureEnabled('ENABLE_IMAGE_CDN')) {
  const optimizedImage = await imageClient.uploadImage(file);
}
```

### ENABLE_REDIS_CACHE

**Purpose**: Controls Redis caching system

**Default**: `false`

**Dependencies**:
- `REDIS_URL` or `KV_REST_API_URL`

**Features Enabled**:
- Session storage
- API response caching
- Product catalog caching
- User data caching
- Rate limiting

**Usage**:
```typescript
import { cacheClient } from '@/lib/integrations/redis';

if (isFeatureEnabled('ENABLE_REDIS_CACHE')) {
  await cacheClient.set('products', products, 300); // 5 minutes
}
```

### ENABLE_DEBUG

**Purpose**: Controls debug logging and development features

**Default**: `true`

**Features Enabled**:
- Console logging
- Debug information
- Development warnings
- Feature flag status logging

**Usage**:
```typescript
import { featureFlags } from '@/lib/feature-flags';

if (featureFlags.ENABLE_DEBUG) {
  console.log('Debug information:', data);
}
```

### ENABLE_LOGGING

**Purpose**: Controls application logging

**Default**: `true`

**Features Enabled**:
- API request logging
- Error logging
- Performance logging
- Audit logging

## Implementation Patterns

### 1. Conditional Rendering

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.title}</h3>
      {isFeatureEnabled('ENABLE_ANALYTICS') && (
        <button onClick={() => trackProductView(product)}>
          Track View
        </button>
      )}
    </div>
  );
}
```

### 2. API Route Protection

```typescript
import { requireFeatureFlag } from '@/lib/api-utils';

export const POST = requireFeatureFlag('ENABLE_SQUARE_INTEGRATION')(
  async (request: NextRequest) => {
    // Square integration code
  }
);
```

### 3. Service Initialization

```typescript
import { withFeatureFlag } from '@/lib/feature-flags';

const result = await withFeatureFlag(
  'ENABLE_EMAIL_SERVICE',
  async () => {
    return await emailClient.sendEmail(data);
  },
  () => {
    console.log('Email service disabled, skipping send');
    return { success: false, reason: 'disabled' };
  }
);
```

### 4. Component Wrapping

```typescript
import { withFeatureFlag } from '@/lib/feature-flags';

const SocialMediaFeed = withFeatureFlag(
  'ENABLE_SOCIAL_MEDIA',
  () => <InstagramFeed />,
  () => <div>Social media integration disabled</div>
);
```

## Validation and Error Handling

### Environment Validation

The feature flag system includes validation to ensure required environment variables are present when features are enabled:

```typescript
import { validateFeatureFlags } from '@/lib/feature-flags';

const { valid, errors } = validateFeatureFlags();
if (!valid) {
  console.error('Feature flag validation failed:', errors);
}
```

### Graceful Degradation

When features are disabled, the application should gracefully degrade:

```typescript
// Instead of throwing errors
if (!isFeatureEnabled('ENABLE_EMAIL_SERVICE')) {
  throw new Error('Email service not available');
}

// Use graceful degradation
if (!isFeatureEnabled('ENABLE_EMAIL_SERVICE')) {
  console.log('Email service disabled, notification skipped');
  return { success: true, skipped: true };
}
```

## Testing with Feature Flags

### Unit Testing

```typescript
import { featureFlags } from '@/lib/feature-flags';

// Mock feature flags for testing
jest.mock('@/lib/feature-flags', () => ({
  featureFlags: {
    ENABLE_SQUARE_INTEGRATION: true,
    ENABLE_EMAIL_SERVICE: false,
  },
  isFeatureEnabled: jest.fn((flag) => {
    const flags = {
      ENABLE_SQUARE_INTEGRATION: true,
      ENABLE_EMAIL_SERVICE: false,
    };
    return flags[flag] || false;
  }),
}));
```

### Integration Testing

```typescript
// Test with feature flags enabled
process.env.ENABLE_SQUARE_INTEGRATION = 'true';
process.env.SQUARE_ACCESS_TOKEN = 'test-token';

// Test API endpoint
const response = await request(app)
  .post('/api/products')
  .send(productData)
  .expect(200);

expect(response.body.data.squareId).toBeDefined();
```

### E2E Testing

```typescript
// Cypress test with feature flags
describe('E-commerce Flow', () => {
  beforeEach(() => {
    // Enable required features
    cy.setFeatureFlag('ENABLE_SQUARE_INTEGRATION', true);
    cy.setFeatureFlag('ENABLE_EMAIL_SERVICE', true);
  });

  it('should complete purchase flow', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="checkout"]').click();
    // ... rest of test
  });
});
```

## Monitoring and Observability

### Feature Flag Metrics

Track feature flag usage and impact:

```typescript
// Track feature flag usage
const trackFeatureFlagUsage = (flag: string, enabled: boolean) => {
  analytics.track('feature_flag_usage', {
    flag,
    enabled,
    timestamp: new Date().toISOString(),
  });
};
```

### Health Checks

Include feature flag status in health checks:

```typescript
// Health check endpoint
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      square: isFeatureEnabled('ENABLE_SQUARE_INTEGRATION'),
      email: isFeatureEnabled('ENABLE_EMAIL_SERVICE'),
      analytics: isFeatureEnabled('ENABLE_ANALYTICS'),
    },
  };

  return NextResponse.json(health);
}
```

## Rollout Strategies

### 1. Gradual Rollout

```typescript
// Percentage-based rollout
const shouldEnableFeature = (userId: string, percentage: number) => {
  const hash = hashUserId(userId);
  return (hash % 100) < percentage;
};

// Enable for 10% of users
if (shouldEnableFeature(user.id, 10)) {
  // Enable feature
}
```

### 2. User-Based Rollout

```typescript
// Enable for specific user groups
const isUserInBetaGroup = (user: User) => {
  return user.role === 'admin' || user.email.endsWith('@company.com');
};

if (isUserInBetaGroup(user) && isFeatureEnabled('ENABLE_NEW_FEATURE')) {
  // Show new feature
}
```

### 3. Geographic Rollout

```typescript
// Enable based on user location
const isFeatureEnabledInRegion = (country: string) => {
  const enabledRegions = ['US', 'CA', 'GB'];
  return enabledRegions.includes(country);
};
```

## Best Practices

### 1. Naming Conventions

- Use descriptive names: `ENABLE_SQUARE_INTEGRATION`
- Use consistent prefixes: `ENABLE_`, `DISABLE_`
- Use UPPER_SNAKE_CASE
- Avoid abbreviations

### 2. Documentation

- Document each feature flag
- Include dependencies and requirements
- Provide usage examples
- Update documentation when flags change

### 3. Testing

- Test with flags enabled and disabled
- Include feature flag tests in CI/CD
- Test graceful degradation
- Validate environment requirements

### 4. Monitoring

- Track feature flag usage
- Monitor error rates by flag
- Set up alerts for flag changes
- Regular flag cleanup

### 5. Lifecycle Management

- Remove unused flags
- Deprecate old flags
- Clean up dead code
- Regular flag audit

## Troubleshooting

### Common Issues

**Flag Not Working**
- Check environment variable spelling
- Verify variable is set correctly
- Check for typos in flag name
- Restart application after changes

**Missing Dependencies**
- Run feature flag validation
- Check required environment variables
- Verify service configuration
- Test integration separately

**Performance Impact**
- Monitor flag check frequency
- Cache flag values if needed
- Use lazy evaluation
- Optimize flag logic

### Debug Tools

```typescript
// Debug feature flags
import { logFeatureFlagsStatus } from '@/lib/feature-flags';

// Log current flag status
logFeatureFlagsStatus();

// Check specific flag
console.log('Square enabled:', isFeatureEnabled('ENABLE_SQUARE_INTEGRATION'));

// Get all enabled flags
console.log('Enabled flags:', getEnabledFeatures());
```

## Migration Guide

### Adding New Feature Flags

1. **Define the flag**
   ```typescript
   // Add to feature-flags.ts
   ENABLE_NEW_FEATURE: getFeatureFlag('ENABLE_NEW_FEATURE', false),
   ```

2. **Add environment variable**
   ```env
   ENABLE_NEW_FEATURE="false"
   ```

3. **Update validation**
   ```typescript
   // Add validation rules if needed
   if (featureFlags.ENABLE_NEW_FEATURE) {
     // Check required dependencies
   }
   ```

4. **Implement feature**
   ```typescript
   // Use the flag in your code
   if (isFeatureEnabled('ENABLE_NEW_FEATURE')) {
     // New feature code
   }
   ```

### Removing Feature Flags

1. **Remove from code**
   - Remove all references to the flag
   - Remove conditional logic
   - Clean up related code

2. **Remove from environment**
   - Remove from .env.example
   - Remove from production environment
   - Update documentation

3. **Test thoroughly**
   - Verify feature works without flag
   - Test all code paths
   - Update tests

## Security Considerations

### Environment Security

- Store flags in secure environment variables
- Use different values for different environments
- Rotate secrets regularly
- Monitor flag changes

### Access Control

- Limit who can change feature flags
- Audit flag changes
- Use version control for flag changes
- Implement approval processes

### Data Privacy

- Consider privacy implications of flags
- Document data collection by feature
- Comply with privacy regulations
- Regular privacy impact assessments
