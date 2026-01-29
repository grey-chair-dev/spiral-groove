
import { Product, StaffPick, Event } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Currents',
    artist: 'Tame Impala',
    price: 32.99,
    coverUrl: 'https://picsum.photos/400/400?random=1',
    format: 'LP',
    genre: 'Psych Rock',
    condition: 'Mint',
    isNewArrival: true,
    tags: ['Best Seller'],
    inStock: true,
    releaseDate: '2015-07-17'
  },
  {
    id: '2',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    price: 28.50,
    salePrice: 22.50,
    onSale: true,
    coverUrl: 'https://picsum.photos/400/400?random=2',
    format: 'LP',
    genre: 'Classic Rock',
    condition: 'VG+',
    isNewArrival: true,
    tags: ['Classic', 'Bargain Bin'],
    inStock: false,
    releaseDate: '1977-02-04'
  },
  {
    id: '3',
    title: 'Head Hunters',
    artist: 'Herbie Hancock',
    price: 45.00,
    coverUrl: 'https://picsum.photos/400/400?random=3',
    format: 'LP',
    genre: 'Jazz Funk',
    condition: 'Near Mint',
    isNewArrival: true,
    tags: ['Audiophile'],
    inStock: true,
    releaseDate: '1973-10-13'
  },
  {
    id: '4',
    title: 'Dummy',
    artist: 'Portishead',
    price: 35.00,
    coverUrl: 'https://picsum.photos/400/400?random=4',
    format: '2xLP',
    genre: 'Trip Hop',
    condition: 'Mint',
    isNewArrival: false,
    inStock: true,
    releaseDate: '1994-08-22'
  },
  {
    id: '5',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    price: 24.99,
    coverUrl: 'https://picsum.photos/400/400?random=5',
    format: 'LP',
    genre: 'Jazz',
    condition: 'Mint',
    isNewArrival: true,
    inStock: false,
    releaseDate: '1959-08-17'
  },
  {
    id: '6',
    title: 'Unknown Pleasures',
    artist: 'Joy Division',
    price: 38.00,
    salePrice: 28.00,
    onSale: true,
    coverUrl: 'https://picsum.photos/400/400?random=6',
    format: 'LP',
    genre: 'Post-Punk',
    condition: 'VG+',
    isNewArrival: false,
    tags: ['Last Chance'],
    inStock: true,
    releaseDate: '1979-06-15'
  },
  {
    id: '7',
    title: 'The Low End Theory',
    artist: 'A Tribe Called Quest',
    price: 42.00,
    coverUrl: 'https://picsum.photos/400/400?random=7',
    format: '2xLP',
    genre: 'Hip Hop',
    condition: 'Near Mint',
    isNewArrival: true,
    inStock: true,
    releaseDate: '1991-09-24'
  },
  {
    id: '8',
    title: 'Blue',
    artist: 'Joni Mitchell',
    price: 150.00,
    coverUrl: 'https://picsum.photos/400/400?random=8',
    format: 'LP',
    genre: 'Folk',
    condition: 'VG',
    isNewArrival: false,
    tags: ['First Pressing'],
    inStock: true,
    releaseDate: '1971-06-22'
  },
  {
    id: '9',
    title: 'Mystery Bag (5x 45s)',
    artist: 'Various Artists',
    price: 5.00,
    coverUrl: 'https://picsum.photos/400/400?random=9',
    format: '45',
    genre: 'Soul / Funk',
    condition: 'VG+',
    tags: ['Mystery', 'Bargain Bin'],
    inStock: true,
    releaseDate: '2023-01-01'
  },
  {
    id: '10',
    title: 'Whipped Cream & Other Delights',
    artist: 'Herb Alpert',
    price: 3.00,
    coverUrl: 'https://picsum.photos/400/400?random=10',
    format: 'LP',
    genre: 'Pop',
    condition: 'VG',
    tags: ['Bargain Bin'],
    inStock: true,
    releaseDate: '1965-04-01'
  },
  {
    id: '11',
    title: 'Dark Side of the Moon (Damaged Jacket)',
    artist: 'Pink Floyd',
    price: 15.00,
    salePrice: 8.00,
    onSale: true,
    coverUrl: 'https://picsum.photos/400/400?random=11',
    format: 'LP',
    genre: 'Rock',
    condition: 'VG',
    tags: ['Last Chance'],
    inStock: true,
    releaseDate: '1973-03-01'
  }
];

export const STAFF_PICKS: StaffPick[] = [
  {
    ...PRODUCTS[2],
    staffName: 'Sarah',
    staffNote: "The bassline on 'Chameleon' is illegal. If you don't own this, we can't be friends.",
    staffImage: 'https://picsum.photos/100/100?random=50'
  },
  {
    ...PRODUCTS[6],
    staffName: 'Marcus',
    staffNote: "Essential 90s hip-hop. The jazz samples are buttery smooth. Sounds best on Sunday mornings.",
    staffImage: 'https://picsum.photos/100/100?random=51'
  },
  {
    ...PRODUCTS[5],
    staffName: 'Jazzy',
    staffNote: "Post-punk perfection. You can practically hear the Manchester rain in the production.",
    staffImage: 'https://picsum.photos/100/100?random=52'
  },
  {
    ...PRODUCTS[3],
    staffName: 'Sarah',
    staffNote: "Beth Gibbons' voice is haunting. Put this on when it's raining and you want to feel like a noir detective.",
    staffImage: 'https://picsum.photos/100/100?random=50'
  }
];

export const EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Local Showcase: The Vibe',
    date: 'OCT 14',
    time: '8:00 PM',
    description: 'Our monthly showcase of local electronic talent. No cover.',
    type: 'Live Show',
    imageUrl: 'https://picsum.photos/600/400?random=90'
  },
  {
    id: 'e2',
    title: 'Sunday Spin: Blue Note Era',
    date: 'OCT 22',
    time: '11:00 AM',
    description: 'Coffee and classics. We play the entire Blue Note catalog from 1964.',
    type: 'Listening Party',
    imageUrl: 'https://picsum.photos/600/400?random=91'
  }
];

export const GENRE_DATA = [
  { name: 'Rock', value: 35 },
  { name: 'Jazz', value: 25 },
  { name: 'Hip Hop', value: 20 },
  { name: 'Electronic', value: 15 },
  { name: 'Other', value: 5 },
];
