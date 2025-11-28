# Vercel Serverless Functions Setup

This project includes Vercel serverless functions that connect to Square API to fetch products.

## Architecture

```
Square POS → Vercel API Functions → React Frontend
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@vercel/node` - Vercel serverless function runtime
- `squareup-node` - Square SDK for Node.js

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect the configuration

### 3. Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=your_location_id
SQUARE_APPLICATION_ID=your_app_id
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key
```

**Important:** These are server-side only (no `VITE_` prefix) and will be available to the API functions.

### 4. Update Frontend Environment Variables

After deploying to Vercel, update `.env.local` with your Vercel URLs:

```bash
# Replace with your actual Vercel deployment URL
VITE_PRODUCTS_SNAPSHOT_URL=https://your-project.vercel.app/api/products/:appId
VITE_ADAPTER_HEALTH_URL=https://your-project.vercel.app/api/health
VITE_ENABLE_MOCK_DATA=false
```

### 5. Local Development

For local development with Vercel functions:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run Vercel dev server (runs both frontend and API functions)
vercel dev
```

This will:
- Start the Vercel dev server on `http://localhost:3000`
- Serve your API functions at `/api/*`
- You can access the frontend and API from the same port

Then update `.env.local` for local dev:

```bash
VITE_PRODUCTS_SNAPSHOT_URL=http://localhost:3000/api/products/:appId
VITE_ADAPTER_HEALTH_URL=http://localhost:3000/api/health
```

## API Endpoints

### GET `/api/products/[appId]`

Fetches products from Square Catalog API.

**Example:**
```
GET /api/products/spiralgroove
```

**Response:**
```json
{
  "products": [
    {
      "id": "item-id",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "category": "Category Name",
      "stockCount": 10,
      "imageUrl": "https://...",
      "rating": 4.5,
      "reviewCount": 0
    }
  ]
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "square-data-adapter",
  "configured": true
}
```

## How It Works

1. **Square API Integration**: The serverless function uses Square SDK to fetch:
   - Catalog items (products)
   - Item variations (SKUs, prices)
   - Inventory counts
   - Categories
   - Images

2. **Data Transformation**: Square catalog objects are transformed to match the `Product` type expected by the frontend.

3. **Caching**: Vercel automatically caches responses. For real-time updates, consider:
   - Using Square webhooks to trigger cache invalidation
   - Implementing a polling interval in the frontend
   - Using a WebSocket service (separate implementation)

## Troubleshooting

### Products not showing up

1. Check Vercel function logs: `vercel logs`
2. Verify Square credentials are set in Vercel environment variables
3. Check that your Square location has catalog items
4. Verify the `appId` in the URL matches your configuration

### CORS errors

Vercel functions should handle CORS automatically. If you see CORS errors:
- Check that your frontend URL is allowed
- Verify the API endpoint URL is correct

### Square API errors

- Verify your access token is valid
- Check that your Square app has the required permissions
- Ensure you're using the correct environment (sandbox vs production)

## Next Steps

- **WebSocket Support**: For real-time updates, consider adding a WebSocket service
- **Caching**: Add Redis/Upstash for better caching
- **Webhooks**: Set up Square webhooks to update inventory in real-time
- **Error Handling**: Add retry logic and better error messages

