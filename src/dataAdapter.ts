/**
 * Product Data Adapter
 * 
 * This module fetches product data exclusively from the Neon PostgreSQL database
 * via the /api/products endpoint. All product data comes from Square catalog
 * synced to Neon via the sync-square-catalog.mjs script.
 * 
 * No WebSocket, REST fallback, or mock data - this is a simple API wrapper.
 */

import { sanitizeText } from './utils/sanitize'
import { getProductImageUrl } from './utils/defaultProductImage'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  categories?: string[]
  stockCount: number
  imageUrl: string
  rating: number
  reviewCount: number
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'

const PRODUCTS_CACHE_KEY = 'sg:lastProductsCache:v1'
const PRODUCTS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

type ProductsCachePayload = {
  ts: number
  products: Product[]
}

function readCachedProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProductsCachePayload
    if (!parsed?.ts || !Array.isArray(parsed.products)) return null
    if (Date.now() - parsed.ts > PRODUCTS_CACHE_MAX_AGE_MS) return null
    return parsed.products
  } catch {
    return null
  }
}

function writeCachedProducts(products: Product[]) {
  try {
    const payload: ProductsCachePayload = { ts: Date.now(), products }
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore (private mode / quota)
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithRetry(url: string, opts: RequestInit, attempts: number) {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(url, { ...opts, signal: controller.signal })
      clearTimeout(timeout)
      return res
    } catch (e) {
      lastErr = e
      // basic exponential backoff
      await sleep(250 * Math.pow(2, i))
    }
  }
  throw lastErr
}

/**
 * Fetches products from Neon database via the API endpoint
 * All product data comes exclusively from Neon PostgreSQL database
 * @param appId - Application ID (unused, kept for compatibility)
 * @returns Promise<Product[]> - Returns empty array if Neon query fails
 */
export async function fetchProducts(appId?: string): Promise<Product[]> {
  try {
    // @ts-ignore - Vite environment variables
    const apiUrl = import.meta.env.VITE_PRODUCTS_API_URL || '/api/products'
    const response = await fetchWithRetry(
      apiUrl,
      { headers: { accept: 'application/json' } },
      3
    )

    // Get response text first to handle empty responses
    const responseText = await response.text()
    
    if (!response.ok) {
      let errorMsg = `Failed to fetch products: ${response.status} ${response.statusText}`
      let errorDetails = {}
      
      // Try to parse JSON if response has content
      if (responseText && responseText.trim()) {
        try {
          const data = JSON.parse(responseText)
          errorMsg = data.error || data.message || errorMsg
          errorDetails = data.details || {}
        } catch (e) {
          // If not JSON, use the text as error message
          errorMsg = responseText || errorMsg
          const parseError = e instanceof Error ? e.message : String(e)
          console.warn('[Products] Response is not valid JSON:', responseText.substring(0, 200), parseError)
    }
      } else {
        console.error('[Products] Empty response body from API')
      }
      
      console.error('[Products] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMsg,
        details: errorDetails,
        responseText: responseText ? responseText.substring(0, 200) : '(empty)'
      })
      const detailsMsg = (errorDetails as any)?.message
      throw new Error(`${errorMsg}${detailsMsg ? `: ${detailsMsg}` : ''}`)
    }
    
    // Parse JSON from response text
    if (!responseText || !responseText.trim()) {
      console.error('[Products] Empty response body')
      throw new Error('Empty response from API')
    }
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[Products] Failed to parse JSON response:', responseText.substring(0, 200))
      throw new Error(`Invalid JSON response from API: ${errorMsg}`)
    }
    
    const products = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []
    
    if (products.length === 0) {
      console.warn('[Products] No products found in Neon database')
    } else {
      console.log(`[Products] Loaded ${products.length} products from Neon`)
    }
    
    const sanitized = sanitizeBatch(products)
    if (sanitized.length > 0) {
      writeCachedProducts(sanitized)
    }
    return sanitized
  } catch (error) {
    console.error('[Products] Failed to fetch products from Neon database:', error)
    const cached = readCachedProducts()
    if (cached && cached.length > 0) {
      console.warn('[Products] Using cached products (last-known-good) due to fetch error')
      return cached
    }
    // No cache available
    return []
  }
}

function sanitizeBatch(payload: Product[]): Product[] {
  return payload.map((product) => sanitizeProduct(product))
}

function sanitizeProduct(product: Product): Product {
  const safeImage = sanitizeImageUrl(product.imageUrl)
  return {
    ...product,
    id: sanitizeText(product.id, { maxLength: 120 }) || crypto.randomUUID(),
    name: sanitizeText(product.name, { maxLength: 160 }),
    description: sanitizeText(product.description, { maxLength: 800 }),
    category: sanitizeText(product.category, { maxLength: 120 }),
    categories: Array.isArray(product.categories) ? product.categories.map(c => sanitizeText(c, { maxLength: 120 })) : [],
    imageUrl: safeImage,
    price: coerceNumber(product.price, 0, 2),
    stockCount: Math.max(0, Math.round(coerceNumber(product.stockCount, 0, 0))),
    rating: clamp(coerceNumber(product.rating, 4.5, 1), 0, 5),
    reviewCount: Math.max(0, Math.round(coerceNumber(product.reviewCount, 0, 0))),
  }
}

function sanitizeImageUrl(url: string): string {
  const candidate = sanitizeText(url, { maxLength: 500 })
  // Use the default product image utility
  return getProductImageUrl(candidate)
}

function coerceNumber(value: unknown, fallback: number, precision: number): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN
  if (Number.isNaN(numeric)) return fallback
  const factor = precision ? 10 ** precision : 1
  return precision ? Math.round(numeric * factor) / factor : numeric
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
