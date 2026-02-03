/**
 * Utility functions for deriving categories from products
 * Only shows album (vinyl) categories that actually exist in the product list
 */

import { Product } from '../../types';
import { ProductCategory } from '../types/productEnums';

/**
 * Album categories that should be shown (vinyl records only)
 */
export const ALBUM_CATEGORIES = [
  // Explicit vinyl categories
  'New Vinyl',
  'Used Vinyl',
  '33New',
  '33Used',
  '45',
  // Music genres (these are typically vinyl albums)
  ProductCategory.ROCK,
  ProductCategory.JAZZ,
  ProductCategory.BLUES,
  ProductCategory.COUNTRY,
  ProductCategory.FOLK,
  ProductCategory.ELECTRONIC,
  ProductCategory.FUNK_SOUL,
  ProductCategory.INDIE,
  ProductCategory.INDUSTRIAL,
  ProductCategory.METAL,
  ProductCategory.POP,
  ProductCategory.PUNK_SKA,
  ProductCategory.RAP_HIP_HOP,
  ProductCategory.REGGAE,
  ProductCategory.SINGER_SONGWRITER,
  ProductCategory.SOUNDTRACKS,
  ProductCategory.BLUEGRASS,
  ProductCategory.COMPILATIONS,
  ProductCategory.OTHER,
  'Box Set',
  'Record Store Day',
];

/**
 * Categories to exclude (non-album items)
 */
export const EXCLUDE_CATEGORIES = [
  "DVD's",
  'DVDs',
  'Videogames',
  'VHS',
  "CD's",
  'CDs',
  'Cassettes',
  'Food',
  'Drinks',
  'Jewelry',
  'Equipment',
  'T-Shirts',
  'Tote Bag',
  'Candles',
  'Animals (Minis)',
  'Spin Clean',
  'Sticker',
  'Action Figures',
  'Funko Pop',
  'Adapters',
  'Buttons',
  'Coasters',
  'Coffee Mug',
  'Crates',
  'Guitar picks',
  'Hats',
  'Patches',
  'Pin',
  'Poster',
  'Sleeves',
  'Slip Mat',
  'Wallets',
  'Wristband',
  'Book',
  'Boombox',
  'Bowl',
  'Box Set',
  'Incense',
  'Charms',
  'Sprouts',
  'Lava Lamps',
  'Essential Oils',
  'Puzzle',
  'Record Store Day',
  'Miscellaneous',
  'Reel To Reel',
  'Vinyl Styl',
  'ABL',
];

/**
 * Get unique categories from products that are albums
 */
export function getAvailableAlbumCategories(products: Product[]): string[] {
  const categorySet = new Set<string>();
  
  products.forEach(product => {
    // Check category field
    const category = product.category || product.tags?.[0] || '';
    if (category && ALBUM_CATEGORIES.includes(category) && !EXCLUDE_CATEGORIES.includes(category)) {
      categorySet.add(category);
    }
    
    // Check all_categories array
    if (product.categories && Array.isArray(product.categories)) {
      product.categories.forEach(cat => {
        if (cat && ALBUM_CATEGORIES.includes(cat) && !EXCLUDE_CATEGORIES.includes(cat)) {
          categorySet.add(cat);
        }
        // Also check if all_categories contains "New Vinyl" or "Used Vinyl"
        if (cat === 'New Vinyl' || cat === 'Used Vinyl') {
          categorySet.add(cat);
        }
      });
    }
  });
  
  return Array.from(categorySet).sort();
}

/**
 * Get available genres from products
 */
export function getAvailableGenres(products: Product[]): string[] {
  const genres = [
    ProductCategory.ROCK,
    ProductCategory.JAZZ,
    ProductCategory.RAP_HIP_HOP,
    ProductCategory.FUNK_SOUL,
    ProductCategory.INDIE,
    ProductCategory.METAL,
    ProductCategory.PUNK_SKA,
    ProductCategory.REGGAE,
    ProductCategory.COUNTRY,
    ProductCategory.ELECTRONIC,
    ProductCategory.BLUES,
    ProductCategory.FOLK,
    ProductCategory.POP,
    ProductCategory.SOUNDTRACKS,
  ];
  
  const availableGenres = genres.filter(genre => {
    return products.some(product => {
      const category = product.category || product.tags?.[0] || '';
      const categories = product.categories || [];
      return category === genre || categories.includes(genre);
    });
  });
  
  return availableGenres;
}

/**
 * Get available vinyl formats from products
 */
export function getAvailableVinylFormats(products: Product[]): string[] {
  const formats: string[] = [];
  
  // Check for New Vinyl
  if (products.some(p => (p.category || p.tags?.[0] || '') === 'New Vinyl' || (p.categories || []).includes('New Vinyl'))) {
    formats.push('New Vinyl');
  }
  
  // Check for Used Vinyl
  if (products.some(p => (p.category || p.tags?.[0] || '') === 'Used Vinyl' || (p.categories || []).includes('Used Vinyl'))) {
    formats.push('Used Vinyl');
  }
  
  // Check for other vinyl-related categories
  const vinylKeywords = ['45', '33New', '33Used', 'Box Set', 'Record Store Day', 'Compilations'];
  vinylKeywords.forEach(keyword => {
    if (products.some(p => {
      const category = p.category || p.tags?.[0] || '';
      const categories = p.categories || [];
      return category === keyword || categories.includes(keyword);
    })) {
      formats.push(keyword);
    }
  });
  
  return formats;
}
