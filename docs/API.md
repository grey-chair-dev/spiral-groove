# API Documentation

## Overview

The Spiral Groove Records API provides endpoints for managing products, orders, events, and user authentication. All API responses follow a consistent format and include proper error handling.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Product Endpoints

### Get Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search term
- `category` (string) - Filter by category
- `condition` (string) - Filter by condition
- `priceMin` (number) - Minimum price
- `priceMax` (number) - Maximum price
- `sortBy` (string) - Sort field (title, artist, price, createdAt)
- `sortOrder` (string) - Sort order (asc, desc)

**Example:**
```http
GET /api/products?page=1&limit=10&search=pink&category=Rock&sortBy=price&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "title": "Pink Floyd - Dark Side of the Moon",
      "artist": "Pink Floyd",
      "genre": "Rock",
      "condition": "VG+",
      "price": 25.99,
      "images": ["image1.jpg", "image2.jpg"],
      "description": "Classic album in excellent condition",
      "inStock": true,
      "squareId": "square_123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Single Product
```http
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "title": "Pink Floyd - Dark Side of the Moon",
    "artist": "Pink Floyd",
    "genre": "Rock",
    "condition": "VG+",
    "price": 25.99,
    "images": ["image1.jpg", "image2.jpg"],
    "description": "Classic album in excellent condition",
    "inStock": true,
    "squareId": "square_123",
    "relatedProducts": [
      {
        "id": "prod_124",
        "title": "Pink Floyd - Wish You Were Here",
        "price": 22.99
      }
    ]
  }
}
```

### Create Product (Admin)
```http
POST /api/products
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "title": "New Album",
  "artist": "Artist Name",
  "genre": "Rock",
  "condition": "NM",
  "price": 29.99,
  "description": "Album description",
  "images": ["image1.jpg"],
  "inStock": true,
  "stockQuantity": 5
}
```

## Cart Endpoints

### Get Cart
```http
GET /api/cart
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart_123",
    "items": [
      {
        "id": "item_123",
        "productId": "prod_123",
        "title": "Pink Floyd - Dark Side of the Moon",
        "price": 25.99,
        "quantity": 1,
        "total": 25.99
      }
    ],
    "subtotal": 25.99,
    "tax": 2.08,
    "total": 28.07
  }
}
```

### Add to Cart
```http
POST /api/cart/add
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 1
}
```

### Update Cart Item
```http
PUT /api/cart/:itemId
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "quantity": 2
}
```

### Remove from Cart
```http
DELETE /api/cart/:itemId
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

## Order Endpoints

### Get Orders
```http
GET /api/orders
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "status": "delivered",
      "total": 28.07,
      "items": [
        {
          "productId": "prod_123",
          "title": "Pink Floyd - Dark Side of the Moon",
          "price": 25.99,
          "quantity": 1
        }
      ],
      "shippingAddress": {
        "name": "John Doe",
        "street": "123 Main St",
        "city": "Milford",
        "state": "OH",
        "zip": "45150"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Create Order
```http
POST /api/orders
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "cartId": "cart_123",
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Milford",
    "state": "OH",
    "zip": "45150",
    "country": "US"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Milford",
    "state": "OH",
    "zip": "45150",
    "country": "US"
  },
  "paymentMethod": "square_token_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "status": "pending",
    "total": 28.07,
    "items": [
      {
        "productId": "prod_123",
        "title": "Pink Floyd - Dark Side of the Moon",
        "price": 25.99,
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Milford",
      "state": "OH",
      "zip": "45150"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Event Endpoints

### Get Events
```http
GET /api/events
```

**Query Parameters:**
- `status` (string) - Filter by status (upcoming, ongoing, completed, cancelled)
- `dateFrom` (string) - Filter events from date (ISO string)
- `dateTo` (string) - Filter events to date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_123",
      "title": "Live Music: Local Band Night",
      "description": "Join us for an evening of live music",
      "date": "2024-02-15T19:00:00Z",
      "capacity": 50,
      "price": 15.00,
      "image": "event_image.jpg",
      "status": "upcoming"
    }
  ]
}
```

### Submit Event Inquiry
```http
POST /api/events/inquiry
```

**Request Body:**
```json
{
  "eventId": "event_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "Interested in booking this event",
  "attendees": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inquiry_123",
    "eventId": "event_123",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `INSUFFICIENT_STOCK` | 400 | Not enough inventory |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 5 attempts per minute per IP
- **Contact forms**: 3 submissions per hour per IP

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## Webhooks

### Square Webhooks

The API supports Square webhooks for real-time updates:

**Endpoint**: `POST /api/webhooks/square`

**Events**:
- `inventory.updated` - Product inventory changes
- `payment.updated` - Payment status changes
- `order.updated` - Order status changes

**Verification**: Webhook signature verification is required using the `SQUARE_WEBHOOK_SIGNATURE_KEY`.

## SDK Examples

### JavaScript/TypeScript

```typescript
class SpiralGrooveAPI {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  async getProducts(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products?${query}`);
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }
}

// Usage
const api = new SpiralGrooveAPI('http://localhost:3000/api');
api.setToken('your-jwt-token');

const products = await api.getProducts({ page: 1, limit: 10 });
```

### cURL Examples

**Get Products:**
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Add to Cart:**
```bash
curl -X POST "http://localhost:3000/api/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"productId": "prod_123", "quantity": 1}'
```

**Create Order:**
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "cartId": "cart_123",
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Milford",
      "state": "OH",
      "zip": "45150",
      "country": "US"
    },
    "billingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Milford",
      "state": "OH",
      "zip": "45150",
      "country": "US"
    },
    "paymentMethod": "square_token_123"
  }'
```
