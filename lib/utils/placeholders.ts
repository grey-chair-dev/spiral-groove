/**
 * Placeholder image utilities
 * Provides consistent naming and alt text for placeholder images
 * Designed to transition seamlessly to real product images from Square API
 * Uses real album covers from /images/placeholders/albums/ as placeholders for vinyl products
 * Controlled by ENABLE_ALBUM_PLACEHOLDERS feature flag
 */

import { isFeatureEnabled } from '@/lib/features';

// Available real album images for placeholder use - matches actual files in /images/placeholders/albums/
export const REAL_ALBUMS = [
  { path: '/images/placeholders/albums/nas-illmatic.jpg', artist: 'Nas', title: 'Illmatic' },
  { path: '/images/placeholders/albums/miles-davis-kind-of-blue.jpg', artist: 'Miles Davis', title: 'Kind of Blue' },
  { path: '/images/placeholders/albums/daft-punk.jpg', artist: 'Daft Punk', title: 'Daft Punk' },
  { path: '/images/placeholders/albums/tyler-the-creator-flower-boy.jpg', artist: 'Tyler, The Creator', title: 'Flower Boy' },
  { path: '/images/placeholders/albums/talking-heads-remain-in-light.jpg', artist: 'Talking Heads', title: 'Remain in Light' },
  { path: '/images/placeholders/albums/nina-simone-i-put-a-spell-on-you.jpg', artist: 'Nina Simone', title: 'I Put a Spell on You' },
  { path: '/images/placeholders/albums/carole-king-tapestry.jpg', artist: 'Carole King', title: 'Tapestry' },
  { path: '/images/placeholders/albums/pink-floyd-dark-side-of-the-moon.jpg', artist: 'Pink Floyd', title: 'The Dark Side of the Moon' },
  { path: '/images/placeholders/albums/Olivia-Rodrigo-SOUR.webp', artist: 'Olivia Rodrigo', title: 'SOUR' },
] as const;

/**
 * Get an album image for placeholder use
 * Cycles through all albums deterministically based on product ID
 * Ensures no repeats until all albums have been used
 */
function getRealAlbumPlaceholder(productId?: string | number): { path: string; artist: string; title: string } {
  // Extract numeric ID from productId for deterministic album selection
  let numericId = 0;
  if (productId !== undefined) {
    if (typeof productId === 'string') {
      // Extract numbers from string (e.g., "demo-1" -> 1, "123" -> 123)
      const match = productId.match(/\d+/);
      numericId = match ? parseInt(match[0], 10) : 0;
    } else {
      numericId = productId;
    }
  }
  
  // Cycle through all albums based on product ID (no repeats until all used)
  const idx = (numericId - 1) % REAL_ALBUMS.length;
  return REAL_ALBUMS[idx];
}

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
  // Album images in /images/placeholders/albums/ are used as placeholders
  if (url.includes('/images/placeholders/albums/')) {
    return true;
  }
  
  // Generic placeholder images (vinyl.jpg, equipment.jpg, etc.)
  if (url.includes('/images/placeholders/') && url.match(/\/images\/placeholders\/[^/]+\.(jpg|jpeg|png|webp)$/i)) {
    return true;
  }
  
  // Carousel/new.png and other carousel images are placeholders
  if (url.includes('/carousel/')) {
    return true;
  }
  
  return url.includes('/placeholder/') || 
         url.includes('placeholder') ||
         url.includes('unsplash.com'); // Temporary: remove when switching to real images
}

/**
 * Get product image with fallback to placeholder
 * When Square API is integrated, this will return real product images
 * For vinyl products, uses real album covers from /images/placeholders/albums/ as placeholders
 */
export function getProductImage(
  imageUrl: string | undefined,
  category: ProductCategory = 'vinyl',
  section?: PlaceholderSection,
  productId?: string | number
): { src: string; alt: string; isPlaceholder: boolean; albumTitle?: string; albumArtist?: string } {
  // Normalize category to lowercase for comparison
  const normalizedCategory = typeof category === 'string' ? category.toLowerCase() : 'vinyl';
  
  // For vinyl products, ALWAYS use album placeholders from REAL_ALBUMS
  // Ignore any imageUrl (even if it's vinyl.jpg) and use album covers instead
  // Cycles through all 9 albums deterministically based on product ID (no repeats)
  if (normalizedCategory === 'vinyl') {
    const album = getRealAlbumPlaceholder(productId);
    return {
      src: album.path,
      alt: `${album.title} by ${album.artist} at Spiral Groove Records`,
      isPlaceholder: true,
      albumTitle: album.title,
      albumArtist: album.artist,
    };
  }
  
  // For non-vinyl products, use real image if provided and not a placeholder
  if (imageUrl && !isPlaceholderImage(imageUrl)) {
    return {
      src: imageUrl,
      alt: getPlaceholderAltText(category),
      isPlaceholder: false,
      albumTitle: undefined,
      albumArtist: undefined,
    };
  }
  
  // Fallback to generic placeholder for non-vinyl products
  return {
    src: getPlaceholderImagePath(category, section),
    alt: getPlaceholderAltText(category),
    isPlaceholder: true,
    albumTitle: undefined,
    albumArtist: undefined,
  };
}

