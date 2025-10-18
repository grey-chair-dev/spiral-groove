/**
 * Mock Data Service
 * Provides realistic mock data for development and testing
 */

export interface Product {
  id: string;
  title: string;
  artist: string;
  label: string;
  condition: 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G';
  price: number; // in cents
  currency: string;
  image: string;
  images?: string[];
  in_stock: boolean;
  quantity?: number;
  tags: string[];
  genre: string;
  decade: string;
  format: 'LP' | 'EP' | 'Single' | '7"' | '12"';
  pressing?: string;
  year?: number;
  description?: string;
  sku?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  image: string;
  price?: number;
  location: string;
  type: 'concert' | 'listening-party' | 'workshop' | 'meetup';
  status: 'upcoming' | 'past' | 'cancelled';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: 'vinyl-101' | 'staff-picks' | 'local-music' | 'events' | 'news';
  image: string;
  tags: string[];
  published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
  album_cover?: string;
}

// Mock Products Data
export const mockProducts: Product[] = [
  {
    id: 'pf-dsotm-1973',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    label: 'Harvest',
    condition: 'VG+',
    price: 2499,
    currency: 'USD',
    image: '/images/vinyl/dark-side-moon.jpg',
    images: ['/images/vinyl/dark-side-moon-1.jpg', '/images/vinyl/dark-side-moon-2.jpg'],
    in_stock: true,
    quantity: 3,
    tags: ['rock', 'progressive', 'classic', '70s'],
    genre: 'Progressive Rock',
    decade: '1970s',
    format: 'LP',
    pressing: '1973 US First Pressing',
    year: 1973,
    description: 'One of the most iconic albums in rock history. Features "Money", "Time", and "Us and Them".',
    sku: 'PF-DSOTM-1973'
  },
  {
    id: 'beatles-abbey-road-1969',
    title: 'Abbey Road',
    artist: 'The Beatles',
    label: 'Apple',
    condition: 'NM',
    price: 3299,
    currency: 'USD',
    image: '/images/vinyl/abbey-road.jpg',
    in_stock: true,
    quantity: 1,
    tags: ['rock', 'pop', 'classic', '60s', 'rare'],
    genre: 'Rock',
    decade: '1960s',
    format: 'LP',
    pressing: '1969 UK First Pressing',
    year: 1969,
    description: 'The Beatles\' final studio album. Features the iconic medley on side two.',
    sku: 'BEAT-AR-1969'
  },
  {
    id: 'led-zeppelin-iv-1971',
    title: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    label: 'Atlantic',
    condition: 'VG',
    price: 1899,
    currency: 'USD',
    image: '/images/vinyl/led-zeppelin-iv.jpg',
    in_stock: true,
    quantity: 2,
    tags: ['rock', 'hard-rock', 'classic', '70s'],
    genre: 'Hard Rock',
    decade: '1970s',
    format: 'LP',
    pressing: '1971 US Pressing',
    year: 1971,
    description: 'Features "Stairway to Heaven" and "Black Dog". Essential rock album.',
    sku: 'LZ-IV-1971'
  },
  {
    id: 'fleetwood-mac-rumours-1977',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    label: 'Warner Bros.',
    condition: 'VG+',
    price: 2199,
    currency: 'USD',
    image: '/images/vinyl/rumours.jpg',
    in_stock: true,
    quantity: 4,
    tags: ['rock', 'pop', 'soft-rock', '70s'],
    genre: 'Soft Rock',
    decade: '1970s',
    format: 'LP',
    pressing: '1977 US Pressing',
    year: 1977,
    description: 'One of the best-selling albums of all time. Features "Go Your Own Way" and "Dreams".',
    sku: 'FM-RUM-1977'
  },
  {
    id: 'bob-dylan-highway-61-1965',
    title: 'Highway 61 Revisited',
    artist: 'Bob Dylan',
    label: 'Columbia',
    condition: 'M',
    price: 4599,
    currency: 'USD',
    image: '/images/vinyl/highway-61.jpg',
    in_stock: true,
    quantity: 1,
    tags: ['folk', 'rock', 'classic', '60s', 'rare'],
    genre: 'Folk Rock',
    decade: '1960s',
    format: 'LP',
    pressing: '1965 US First Pressing',
    year: 1965,
    description: 'Features "Like a Rolling Stone" - one of the greatest songs ever recorded.',
    sku: 'BD-H61-1965'
  },
  {
    id: 'miles-davis-kind-of-blue-1959',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    label: 'Columbia',
    condition: 'VG+',
    price: 2899,
    currency: 'USD',
    image: '/images/vinyl/kind-of-blue.jpg',
    in_stock: true,
    quantity: 2,
    tags: ['jazz', 'classic', '50s', 'essential'],
    genre: 'Jazz',
    decade: '1950s',
    format: 'LP',
    pressing: '1959 US Pressing',
    year: 1959,
    description: 'The best-selling jazz album of all time. Essential listening.',
    sku: 'MD-KOB-1959'
  },
  {
    id: 'nirvana-nevermind-1991',
    title: 'Nevermind',
    artist: 'Nirvana',
    label: 'DGC',
    condition: 'NM',
    price: 1999,
    currency: 'USD',
    image: '/images/vinyl/nevermind.jpg',
    in_stock: true,
    quantity: 3,
    tags: ['grunge', 'alternative', '90s', 'classic'],
    genre: 'Grunge',
    decade: '1990s',
    format: 'LP',
    pressing: '1991 US Pressing',
    year: 1991,
    description: 'The album that defined a generation. Features "Smells Like Teen Spirit".',
    sku: 'NIR-NEV-1991'
  },
  {
    id: 'radiohead-ok-computer-1997',
    title: 'OK Computer',
    artist: 'Radiohead',
    label: 'Capitol',
    condition: 'VG+',
    price: 2299,
    currency: 'USD',
    image: '/images/vinyl/ok-computer.jpg',
    in_stock: true,
    quantity: 2,
    tags: ['alternative', 'rock', '90s', 'experimental'],
    genre: 'Alternative Rock',
    decade: '1990s',
    format: 'LP',
    pressing: '1997 US Pressing',
    year: 1997,
    description: 'A masterpiece of modern rock. Features "Paranoid Android" and "Karma Police".',
    sku: 'RH-OKC-1997'
  }
];

// Mock Events Data
export const mockEvents: Event[] = [
  {
    id: 'vinyl-listening-party-2024-01',
    title: 'Vinyl Listening Party: Classic Rock Night',
    date: '2024-01-15',
    time: '7:00 PM',
    description: 'Join us for an evening of classic rock vinyl listening. We\'ll spin some of the greatest albums from the 60s and 70s.',
    capacity: 30,
    image: '/images/events/classic-rock-night.jpg',
    price: 10,
    location: 'Spiral Groove Records Event Space',
    type: 'listening-party',
    status: 'upcoming'
  },
  {
    id: 'local-band-showcase-2024-01',
    title: 'Local Band Showcase: The Milford Sessions',
    date: '2024-01-22',
    time: '8:00 PM',
    description: 'Supporting local talent! Three amazing local bands performing live in our event space.',
    capacity: 50,
    image: '/images/events/local-band-showcase.jpg',
    price: 15,
    location: 'Spiral Groove Records Event Space',
    type: 'concert',
    status: 'upcoming'
  },
  {
    id: 'turntable-workshop-2024-02',
    title: 'Turntable Setup & Maintenance Workshop',
    date: '2024-02-05',
    time: '2:00 PM',
    description: 'Learn how to properly set up and maintain your turntable. Bring your own equipment!',
    capacity: 20,
    image: '/images/events/turntable-workshop.jpg',
    price: 25,
    location: 'Spiral Groove Records Event Space',
    type: 'workshop',
    status: 'upcoming'
  }
];

// Mock Blog Posts Data
export const mockBlogPosts: BlogPost[] = [
  {
    id: 'vinyl-101-cleaning-guide',
    slug: 'vinyl-101-how-to-clean-your-records',
    title: 'Vinyl 101: How to Clean Your Records',
    excerpt: 'Learn the proper techniques for cleaning and maintaining your vinyl collection to ensure the best sound quality.',
    content: 'Keeping your vinyl records clean is essential for maintaining sound quality and extending their lifespan...',
    author: 'Sarah Johnson',
    date: '2024-01-10',
    category: 'vinyl-101',
    image: '/images/blog/vinyl-cleaning.jpg',
    tags: ['vinyl-care', 'maintenance', 'tutorial'],
    published: true
  },
  {
    id: 'staff-picks-january-2024',
    slug: 'staff-picks-january-2024',
    title: 'Staff Picks: January 2024',
    excerpt: 'Our team shares their favorite new arrivals and hidden gems from this month\'s collection.',
    content: 'This month our staff has been particularly excited about some amazing finds...',
    author: 'Mike Chen',
    date: '2024-01-05',
    category: 'staff-picks',
    image: '/images/blog/staff-picks-jan.jpg',
    tags: ['staff-picks', 'new-arrivals', 'recommendations'],
    published: true
  },
  {
    id: 'local-music-spotlight-river-city',
    slug: 'local-music-spotlight-river-city-band',
    title: 'Local Music Spotlight: River City Band',
    excerpt: 'Discover the amazing sounds of River City Band, one of Cincinnati\'s most promising indie rock groups.',
    content: 'River City Band has been making waves in the local music scene...',
    author: 'Alex Rodriguez',
    date: '2024-01-03',
    category: 'local-music',
    image: '/images/blog/river-city-band.jpg',
    tags: ['local-music', 'indie-rock', 'cincinnati'],
    published: true
  }
];

// Mock Testimonials Data
export const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Jennifer Martinez',
    location: 'Milford, OH',
    text: 'Spiral Groove Records is exactly what I was looking for in a record store. The staff is knowledgeable, the selection is incredible, and the atmosphere is perfect for discovering new music.',
    rating: 5,
    image: '/images/testimonials/jennifer-martinez.jpg',
    album_cover: '/images/vinyl/fleetwood-mac-rumours.jpg'
  },
  {
    id: 'testimonial-2',
    name: 'David Thompson',
    location: 'Cincinnati, OH',
    text: 'I\'ve been collecting vinyl for over 20 years, and this is hands down the best record store in the area. The condition grading is always accurate, and I\'ve found some real gems here.',
    rating: 5,
    image: '/images/testimonials/david-thompson.jpg',
    album_cover: '/images/vinyl/led-zeppelin-iv.jpg'
  },
  {
    id: 'testimonial-3',
    name: 'Maria Garcia',
    location: 'Loveland, OH',
    text: 'The event space is amazing! I hosted my band\'s album release party here and it was perfect. Great sound, intimate setting, and the staff was incredibly helpful.',
    rating: 5,
    image: '/images/testimonials/maria-garcia.jpg',
    album_cover: '/images/vinyl/nirvana-nevermind.jpg'
  }
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(product => product.id === id);
}

export function getProductsByGenre(genre: string): Product[] {
  return mockProducts.filter(product => 
    product.genre.toLowerCase().includes(genre.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
  );
}

export function getNewArrivals(days: number = 14): Product[] {
  // In a real app, this would filter by actual date
  // For mock data, we'll return a subset
  return mockProducts.slice(0, 6);
}

export function getUpcomingEvents(): Event[] {
  return mockEvents.filter(event => event.status === 'upcoming');
}

export function getPublishedBlogPosts(): BlogPost[] {
  return mockBlogPosts.filter(post => post.published);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return mockBlogPosts.find(post => post.slug === slug && post.published);
}
