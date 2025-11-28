# Square Inventory Integration Guide

This guide explains how to connect Spiral Groove to your Square POS inventory.

## Architecture Overview

The app uses a **data adapter pattern**:
- **Frontend (this app)**: Displays products from a data adapter service
- **Data Adapter (separate service)**: Connects to Square API and syncs inventory
- **Square POS**: Your source of truth for products and inventory

```
Square POS → Data Adapter Service → This React App
```

## What You Need

### 1. Data Adapter Service

You need a backend service that:
- Connects to Square API using your Square credentials
- Syncs catalog items and inventory from Square
- Exposes products via:
  - **WebSocket** (for real-time updates)
  - **REST API** (for snapshot/fallback)

The data adapter should:
- Map Square catalog items to the `Product` type expected by this app
- Handle the collection path: `/artifacts/{appId}/public/data/products`
- Provide health check endpoint
- Support WebSocket subscriptions for real-time updates

### 2. Square API Credentials

You'll need:
- **Square Application ID**
- **Square Access Token** (or OAuth tokens)
- **Square Location ID** (if using location-specific inventory)

Get these from: https://developer.squareup.com/apps

### 3. Environment Variables

Update `.env.local` with your data adapter URLs:

```bash
# Your Square location/app identifier
VITE_APP_ID=spiralgroove

# Data adapter WebSocket URL
VITE_PRODUCTS_WS_URL=wss://your-adapter-domain.com/realtime

# Data adapter REST endpoint (fallback)
VITE_PRODUCTS_SNAPSHOT_URL=https://your-adapter-domain.com/api/products/spiralgroove

# Health check endpoint
VITE_ADAPTER_HEALTH_URL=https://your-adapter-domain.com/health

# Disable mock data when adapter is ready
VITE_ENABLE_MOCK_DATA=false
```

## Product Data Format

The data adapter must return products in this format:

```typescript
type Product = {
  id: string              // Square catalog item ID
  name: string            // Item name
  description: string     // Item description
  price: number           // Price in dollars (e.g., 29.99)
  category: string        // Category name
  stockCount: number      // Available quantity
  imageUrl: string        // Product image URL
  rating: number          // Optional: rating (0-5)
  reviewCount: number     // Optional: number of reviews
}
```

### WebSocket Message Format

**Bulk update:**
```json
{
  "products": [
    { "id": "...", "name": "...", ... },
    { "id": "...", "name": "...", ... }
  ]
}
```

**Single product update:**
```json
{
  "product": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

### REST Snapshot Format

Return either:
```json
[
  { "id": "...", "name": "...", ... },
  { "id": "...", "name": "...", ... }
]
```

Or:
```json
{
  "products": [
    { "id": "...", "name": "...", ... }
  ]
}
```

## Testing Without Square

While setting up your data adapter, you can:

1. **Use mock data**: Set `VITE_ENABLE_MOCK_DATA=true` (current setting)
2. **Test with sample data**: The app includes fallback products for testing

## Next Steps

1. **Set up your data adapter service** (or use an existing one)
2. **Update `.env.local`** with your adapter URLs
3. **Set `VITE_ENABLE_MOCK_DATA=false`** when ready
4. **Test the connection** - the app will show connection status in the hero section

## Connection Status

The app displays connection status:
- **Live** (green): WebSocket connected, real-time updates
- **Snapshot** (blue): Using REST polling fallback
- **Mock** (orange): Using mock data
- **Offline** (red): No connection available

## Square API Resources

- [Square Developer Portal](https://developer.squareup.com/)
- [Catalog API](https://developer.squareup.com/reference/square/catalog-api)
- [Inventory API](https://developer.squareup.com/reference/square/inventory-api)
- [Webhooks](https://developer.squareup.com/docs/webhooks/overview) (for real-time sync)

## Need Help?

If you need help setting up the data adapter service, you may need to:
- Build a custom service using Square SDK
- Use a platform that provides Square integration
- Set up a serverless function (AWS Lambda, Vercel, etc.) that syncs Square data

