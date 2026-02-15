
export interface Product {
  id: string;
  title: string;
  artist: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  coverUrl: string;
  format: string;
  genre: string;
  condition: 'Mint' | 'Near Mint' | 'VG+' | 'VG';
  tags?: string[];
  categories?: string[];
  description?: string;
  isNewArrival?: boolean;
  inStock?: boolean;
  stockCount?: number;
  releaseDate?: string;
  soldCount?: number;
  lastSoldAt?: string | null;
  lastStockedAt?: string | null;
  lastAdjustmentAt?: string | null;
  createdAt?: string | null;
}

export interface StaffPick extends Product {
  staffName: string;
  staffNote: string;
  staffImage: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'Live Show' | 'Listening Party' | 'Signing';
  imageUrl: string;
  linkUrl?: string;
  category?: string;
  dateISO?: string;
  startTime?: string;
  endTime?: string;
}

export interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  communicationMethod: 'email';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface OrderItem {
  title: string;
  artist: string;
  format: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  location: string;
  subtotal: number;
  tax: number;
}

export type ViewMode = 'retro' | 'modern';

export type Page =
  | 'home'
  | 'events'
  | 'about'
  | 'locations'
  | 'we-buy'
  | 'catalog'
  | 'product'
  | 'receipt'
  | 'order-status'
  | 'contact'
  | 'staff-picks'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'search'
  | 'privacy'
  | 'terms'
  | 'accessibility'
  | 'edit-reply';
