# Placeholder Image System

This document explains the placeholder image system designed for seamless transition to real Square API product images.

## Overview

The placeholder system ensures consistent naming, alt text, and metadata that will work seamlessly when switching to real product images from Square API.

## File Naming Convention

Placeholder images follow a consistent naming pattern:
- Format: `{category}-placeholder.jpg` or `{category}-{section}-placeholder.jpg`
- Examples:
  - `turntable-placeholder.jpg` → `turntables-placeholder.jpg`
  - `vinyl-new-arrivals-placeholder.jpg`
  - `amplifier-placeholder.jpg`

## Alt Text Convention

All placeholder images use consistent alt text:
- Format: `"{Category} at Spiral Groove Records"`
- Examples:
  - `"Turntables at Spiral Groove Records"`
  - `"Vinyl Records at Spiral Groove Records"`
  - `"Audio Accessories at Spiral Groove Records"`

When real product images are used, alt text becomes:
- Format: `"{Product Title} by {Artist} at Spiral Groove Records"`

## Section Differentiation

Placeholders are visually differentiated by section using CSS filters:
- **New Arrivals**: `brightness-110 saturate-110` (slightly brighter)
- **Staff Picks**: `contrast-110 saturate-105` (enhanced contrast)
- **Vinyl**: `brightness-100 saturate-100` (standard)
- **Equipment**: `brightness-95 contrast-105` (slightly muted)

## Loading States

### Skeleton Loading
- `ProductCardSkeleton` component provides smooth loading experience
- Shows animated pulse effect while products load
- Matches the structure of actual product cards

### Blur-up Effect
- Images fade in smoothly using `transition-opacity`
- Loading skeleton shows until image is fully loaded
- Prevents layout shift and improves perceived performance

## SEO Considerations

### Noindex Meta Tags
Pages using placeholder content automatically add `noindex` meta tags:
- Applied when `isSquareConfigured()` returns `false`
- Prevents search engines from indexing placeholder content
- Automatically removed when Square credentials are configured

### Implementation
```typescript
export const metadata: Metadata = !isSquareConfigured() ? {
  robots: {
    index: false,
    follow: false,
  },
} : {};
```

## Square API Integration

### Image Handling
When Square credentials are configured:
1. Product images are fetched via `getSquareImageUrl(imageId)`
2. Images are retrieved using Square's `retrieveCatalogObject` API
3. Real image URLs replace placeholder paths automatically

### Category Mapping
- Square categories are mapped to `/shop?category=` routes
- Category names are retrieved from Square API
- Fallback to placeholder categories if Square categories unavailable

### Product Fields
The system handles:
- **Images**: Retrieved from Square image IDs
- **Categories**: Mapped from Square category IDs
- **Price**: Converted from cents to dollars
- **Availability**: From Square inventory tracking
- **Condition**: From Square custom attributes
- **Format**: From Square custom attributes (LP, EP, etc.)

## Transition Checklist

When Square credentials are ready:

1. ✅ Placeholder images already use consistent naming
2. ✅ Alt text follows consistent pattern
3. ✅ Loading states are implemented
4. ✅ Section differentiation is in place
5. ✅ Noindex tags will automatically remove
6. ✅ Square catalog integration handles images and categories
7. ⚠️ **Action Required**: Replace placeholder images in `/public/placeholder/` with actual product images matching the naming convention

## File Structure

```
lib/utils/placeholders.ts          # Placeholder utility functions
components/ProductCard.tsx          # Product card with placeholder support
components/ProductCardSkeleton.tsx  # Loading skeleton
components/ProductGrid.tsx          # Grid with section support
lib/square/catalog.ts              # Square API integration
```

## Usage Examples

### Using Placeholder Utilities
```typescript
import { getProductImage, getPlaceholderAltText } from '@/lib/utils/placeholders';

const productImage = getProductImage(
  product.cover,      // Image URL (or undefined)
  'vinyl',           // Category
  'new-arrivals'     // Section (optional)
);

// Returns: { src, alt, isPlaceholder }
```

### Product Card with Section
```tsx
<ProductCard 
  p={product} 
  section="new-arrivals"  // Applies section-specific styling
/>
```

### Product Grid with Section
```tsx
<ProductGrid 
  limit={6} 
  section="staff-picks"  // All cards use staff-picks styling
/>
```

## Best Practices

1. **Always use the placeholder utilities** - Don't hardcode image paths
2. **Pass section prop** - Enables section-specific styling
3. **Use consistent categories** - Matches Square category structure
4. **Test loading states** - Ensure smooth user experience
5. **Monitor SEO** - Verify noindex tags work correctly

