import { Product } from '@/types/product';

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
  
  // Real album data with actual covers - using varied Unsplash images
  const albumData = [
    { artist: 'The Beatles', title: 'Abbey Road', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Pink Floyd', title: 'Dark Side of the Moon', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Led Zeppelin', title: 'Led Zeppelin IV', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Fleetwood Mac', title: 'Rumours', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Michael Jackson', title: 'Thriller', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Eagles', title: 'Hotel California', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'AC/DC', title: 'Back in Black', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Nirvana', title: 'Nevermind', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Radiohead', title: 'OK Computer', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Prince', title: 'Purple Rain', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'David Bowie', title: 'The Rise and Fall of Ziggy Stardust', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Bob Dylan', title: 'Highway 61 Revisited', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Miles Davis', title: 'Kind of Blue', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'John Coltrane', title: 'A Love Supreme', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Aretha Franklin', title: 'I Never Loved a Man', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Stevie Wonder', title: 'Songs in the Key of Life', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'The Rolling Stones', title: 'Exile on Main St.', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'The Clash', title: 'London Calling', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Talking Heads', title: 'Remain in Light', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Depeche Mode', title: 'Violator', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Pearl Jam', title: 'Ten', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Soundgarden', title: 'Superunknown', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Red Hot Chili Peppers', title: 'Blood Sugar Sex Magik', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Beastie Boys', title: 'Paul\'s Boutique', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Public Enemy', title: 'It Takes a Nation of Millions', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'A Tribe Called Quest', title: 'The Low End Theory', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'OutKast', title: 'Aquemini', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27c1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'The Ramones', title: 'Ramones', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'New Order', title: 'Power, Corruption & Lies', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { artist: 'Nina Simone', title: 'I Put a Spell on You', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];
  
  const album = getRandomItem(albumData);
  const artist = album.artist;
  const title = album.title;
  
  return {
    id: `demo-${id}`,
    title,
    artist,
    price: getRandomPrice(),
    cover: album.cover, // Real album covers
    description: `A ${condition?.toLowerCase() || 'unknown'} copy of ${title} by ${artist}. ${format} format from ${year}.`,
    genre,
    condition,
    format,
    decade,
    year,
    label,
    catalogNumber: `${label.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
    inStock: Math.random() > 0.1, // 90% in stock
    stockQuantity: Math.floor(Math.random() * 5) + 1,
    sku: `SGR-${id.toString().padStart(4, '0')}`,
    tags: [genre, decade, condition, format].filter(Boolean) as string[],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
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
