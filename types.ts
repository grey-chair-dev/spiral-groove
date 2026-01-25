
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
  releaseDate?: string;
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
}

export interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  communicationMethod: 'email' | 'phone';
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

export type Page = 'home' | 'events' | 'about' | 'locations' | 'sales' | 'we-buy' | 'catalog' | 'product' | 'orders' | 'receipt' | 'order-status' | 'faq' | 'contact' | 'staff-picks' | 'cart' | 'checkout' | 'order-confirmation' | 'settings' | 'search' | 'privacy' | 'terms' | 'accessibility';
