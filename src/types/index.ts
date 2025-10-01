// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents
  stock: number;
  image?: string;
  condition: 'new' | 'used';
  category?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
}

// Order types
export interface Order {
  id: string;
  lineItems: OrderLineItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

// Event types
export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location?: string;
  price?: number;
  rsvpCount: number;
  maxCapacity?: number;
  image?: string;
}

// User types (future)
export interface User {
  id: string;
  email: string;
  name?: string;
  loyaltyPoints?: number;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

// Newsletter types
export interface NewsletterSubscription {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
}

// Square API types
export interface SquareCatalogItem {
  id: string;
  type: string;
  itemData?: {
    name: string;
    description?: string;
    variations?: SquareCatalogItemVariation[];
  };
}

export interface SquareCatalogItemVariation {
  id: string;
  type: string;
  itemVariationData?: {
    name?: string;
    priceMoney?: {
      amount: number;
      currency: string;
    };
    trackInventory?: boolean;
    inventoryAlertThreshold?: number;
  };
}

export interface SquareOrder {
  id: string;
  locationId: string;
  lineItems: SquareOrderLineItem[];
  totalMoney: {
    amount: number;
    currency: string;
  };
  state: string;
  createdAt: string;
}

export interface SquareOrderLineItem {
  uid: string;
  catalogObjectId: string;
  quantity: string;
  basePriceMoney: {
    amount: number;
    currency: string;
  };
}

