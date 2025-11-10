import { Product } from '@/types/product';
import { REAL_ALBUMS } from '@/lib/utils/placeholders';
import { isFeatureEnabled } from '@/lib/features';

/**
 * Enhanced demo data for Spiral Groove Records
 * Realistic vinyl catalog with proper metadata
 */

const genres = [
  'Rock', 'Jazz', 'Blues', 'Folk', 'Country', 'Soul', 'Funk', 'Disco',
  'Punk', 'New Wave', 'Electronic', 'Hip Hop', 'R&B', 'Classical', 'Reggae'
];

const conditions: Product['condition'][] = [
  'New', 'Used - Excellent', 'Used - Very Good', 'Used - Good', 'Used - Fair'
];

const formats: Product['format'][] = ['LP', 'EP', 'Single', 'CD', 'Cassette'];

const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const labels = [
  'Atlantic Records', 'Columbia Records', 'Warner Bros.', 'Capitol Records',
  'RCA Records', 'Motown', 'Stax Records', 'Blue Note', 'Verve', 'Impulse!',
  'Sub Pop', 'Merge Records', 'Matador', '4AD', 'Rough Trade'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(min: number = 15, max: number = 75): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateProduct(id: number): Product {
  const genre = getRandomItem(genres);
  const condition = getRandomItem(conditions);
  const format = getRandomItem(formats);
  const decade = getRandomItem(decades);
  const year = parseInt(decade.replace('s', '')) + Math.floor(Math.random() * 10);
  const label = getRandomItem(labels);
  
  // Always use real album data from /images/placeholders/albums/ (REAL_ALBUMS)
  // Cycle through all 9 albums deterministically based on product ID (no repeats)
  const albumIndex = (id - 1) % REAL_ALBUMS.length;
  const album = REAL_ALBUMS[albumIndex];
  const artist = album.artist;
  const title = album.title;
  const cover = album.path;
  
  return { id: `demo-${id}`, title, artist, price: getRandomPrice(), cover, description: `A ${condition?.toLowerCase() || 'unknown'} copy of ${title} by ${artist}. ${format} format from ${year}.`, genre, condition, format, decade, year, label, catalogNumber: `${label.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`, inStock: Math.random() > 0.1, stockQuantity: Math.floor(Math.random() * 5) + 1, sku: `SGR-${id.toString().padStart(4, '0')}`, tags: [genre, decade, condition, format].filter(Boolean) as string[], createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() };
}

// Generate 100 demo products
export const demoProducts: Product[] = Array.from({ length: 100 }, (_, i) => generateProduct(i + 1));

// Featured products (first 8)
export const featuredProducts = demoProducts.slice(0, 8);

// New arrivals (last 12, sorted by creation date)
export const newArrivals = demoProducts
  .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  .slice(0, 12);

// Staff picks (curated selection)
export const staffPicks = [
  demoProducts[15], // The Beatles - Greatest Hits
  demoProducts[23], // Miles Davis - Classic
  demoProducts[42], // Nirvana - Essential
  demoProducts[67], // Aretha Franklin - Timeless
  demoProducts[89], // Radiohead - Definitive
];

// Get products by genre
export function getProductsByGenre(genre: string): Product[] {
  return demoProducts.filter(product => product.genre === genre);
}

// Get products by condition
export function getProductsByCondition(condition: Product['condition']): Product[] {
  return demoProducts.filter(product => product.condition === condition);
}

// Get products by format
export function getProductsByFormat(format: Product['format']): Product[] {
  return demoProducts.filter(product => product.format === format);
}

// Get products by decade
export function getProductsByDecade(decade: string): Product[] {
  return demoProducts.filter(product => product.decade === decade);
}

// Get in-stock products only
export function getInStockProducts(): Product[] {
  return demoProducts.filter(product => product.inStock);
}

// Get unique values for filters
export function getUniqueGenres(): string[] {
  return [...new Set(demoProducts.map(p => p.genre).filter(Boolean))] as string[];
}

export function getUniqueConditions(): Product['condition'][] {
  return [...new Set(demoProducts.map(p => p.condition).filter(Boolean))] as Product['condition'][];
}

export function getUniqueFormats(): Product['format'][] {
  return [...new Set(demoProducts.map(p => p.format).filter(Boolean))] as Product['format'][];
}

export function getUniqueDecades(): string[] {
  return [...new Set(demoProducts.map(p => p.decade).filter(Boolean))] as string[];
}
