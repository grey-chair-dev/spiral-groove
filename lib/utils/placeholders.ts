/**
 * Placeholder image utilities
 * Provides consistent naming and alt text for placeholder images
 * Designed to transition seamlessly to real product images from Square API
 */

export type PlaceholderSection = 
  | 'new-arrivals' 
  | 'staff-picks' 
  | 'vinyl' 
  | 'equipment' 
  | 'turntables' 
  | 'amplifiers' 
  | 'accessories'
  | 'default';

export type ProductCategory = 
  | 'vinyl' 
  | 'turntables' 
  | 'amplifiers' 
  | 'accessories' 
  | 'equipment'
  | string;

/**
 * Get placeholder image path based on product category
 * Format: /images/placeholders/{category}.jpg
 * Example: /images/placeholders/vinyl.jpg
 */
export function getPlaceholderImagePath(
  category: ProductCategory = 'vinyl',
  section?: PlaceholderSection
): string {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  
  // Map categories to placeholder images
  const categoryMap: Record<string, string> = {
    'vinyl': 'vinyl',
    'turntables': 'equipment',
    'turntable': 'equipment',
    'amplifiers': 'equipment',
    'amplifier': 'equipment',
    'accessories': 'equipment',
    'equipment': 'equipment',
    'crafts': 'crafts',
  };
  
  const imageCategory = categoryMap[normalizedCategory] || 'vinyl';
  return `/images/placeholders/${imageCategory}.jpg`;
}

/**
 * Generate consistent alt text for placeholder images
 * Format: "{Category} at Spiral Groove Records"
 * Example: "Turntables at Spiral Groove Records"
 */
export function getPlaceholderAltText(
  category: ProductCategory = 'vinyl',
  productName?: string
): string {
  if (productName) {
    return `${productName} at Spiral Groove Records`;
  }
  
  const categoryLabels: Record<string, string> = {
    'vinyl': 'Vinyl Records',
    'turntables': 'Turntables',
    'amplifiers': 'Amplifiers',
    'accessories': 'Audio Accessories',
    'equipment': 'Audio Equipment',
  };
  
  const label = categoryLabels[category.toLowerCase()] || 
    category.charAt(0).toUpperCase() + category.slice(1);
  
  return `${label} at Spiral Groove Records`;
}

/**
 * Get section-specific styling classes for placeholders
 * Differentiates placeholders by section with tint/crop variations
 */
export function getPlaceholderStyles(section?: PlaceholderSection): string {
  const styles: Record<PlaceholderSection, string> = {
    'new-arrivals': 'brightness-110 saturate-110', // Slightly brighter for new items
    'staff-picks': 'contrast-110 saturate-105', // Enhanced contrast for featured
    'vinyl': 'brightness-100 saturate-100', // Standard
    'equipment': 'brightness-95 contrast-105', // Slightly muted for equipment
    'turntables': 'brightness-100 saturate-110',
    'amplifiers': 'brightness-105 saturate-105',
    'accessories': 'brightness-100 saturate-100',
    'default': 'brightness-100 saturate-100',
  };
  
  return styles[section || 'default'];
}

/**
 * Check if an image URL is a placeholder
 * Useful for conditional rendering or metadata
 */
export function isPlaceholderImage(url: string): boolean {
  return url.includes('/placeholder/') || 
         url.includes('placeholder') ||
         url.includes('unsplash.com'); // Temporary: remove when switching to real images
}

/**
 * Get product image with fallback to placeholder
 * When Square API is integrated, this will return real product images
 */
export function getProductImage(
  imageUrl: string | undefined,
  category: ProductCategory = 'vinyl',
  section?: PlaceholderSection
): { src: string; alt: string; isPlaceholder: boolean } {
  if (imageUrl && !isPlaceholderImage(imageUrl)) {
    return {
      src: imageUrl,
      alt: getPlaceholderAltText(category),
      isPlaceholder: false,
    };
  }
  
  return {
    src: getPlaceholderImagePath(category, section),
    alt: getPlaceholderAltText(category),
    isPlaceholder: true,
  };
}

