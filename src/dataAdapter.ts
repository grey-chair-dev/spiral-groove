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
  soldCount?: number
  lastSoldAt?: string | null
  lastStockedAt?: string | null
  lastAdjustmentAt?: string | null
  createdAt?: string | null
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'

const PRODUCTS_CACHE_KEY = 'sg:lastProductsCache:v1'
const PRODUCTS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

type ProductsCachePayload = {
  ts: number
  products: Product[]
  etag?: string
}

export type ProductsPage = {
  products: Product[]
  nextCursor?: string | null
}

function readCachedProductsPayload(): ProductsCachePayload | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProductsCachePayload
    if (!parsed?.ts || !Array.isArray(parsed.products)) return null
    if (Date.now() - parsed.ts > PRODUCTS_CACHE_MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

function readCachedProducts(): Product[] | null {
  return readCachedProductsPayload()?.products ?? null
}

function writeCachedProducts(products: Product[], etag?: string | null) {
  try {
    const payload: ProductsCachePayload = { ts: Date.now(), products, ...(etag ? { etag } : {}) }
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
    const cachedPayload = readCachedProductsPayload()
    const cachedEtag = cachedPayload?.etag
    const response = await fetchWithRetry(
      apiUrl,
      { headers: { accept: 'application/json', ...(cachedEtag ? { 'if-none-match': cachedEtag } : {}) } },
      3
    )

    // Fast path: not modified, use local cache
    if (response.status === 304) {
      const cachedProducts = cachedPayload?.products
      if (cachedProducts && cachedProducts.length > 0) {
        return sanitizeBatch(cachedProducts)
      }
    }

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
          void parseError
    }
      } else {
        // ignore
      }
      
      const detailsMsg = (errorDetails as any)?.message
      throw new Error(`${errorMsg}${detailsMsg ? `: ${detailsMsg}` : ''}`)
    }
    
    // Parse JSON from response text
    if (!responseText || !responseText.trim()) {
      throw new Error('Empty response from API')
    }
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      void responseText
      throw new Error(`Invalid JSON response from API: ${errorMsg}`)
    }
    
    const products = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []
    
    const sanitized = sanitizeBatch(products)
    if (sanitized.length > 0) {
      const etag = response.headers.get('etag')
      writeCachedProducts(sanitized, etag)
    }
    return sanitized
  } catch (error) {
    void error
    const cached = readCachedProducts()
    if (cached && cached.length > 0) {
      return cached
    }
    // No cache available
    return []
  }
}

function buildApiUrl(raw: string, params: Record<string, string | null | undefined>): string {
  // Supports either absolute URLs or relative paths.
  const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://local.test')
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '') url.searchParams.delete(k)
    else url.searchParams.set(k, v)
  }
  return url.toString()
}

/**
 * Fetch one page from /api/products using keyset pagination.
 */
export async function fetchProductsPage(args?: { limit?: number; cursor?: string | null }): Promise<ProductsPage> {
  const limit = args?.limit
  const cursor = args?.cursor
  try {
    // @ts-ignore - Vite environment variables
    const apiUrl = import.meta.env.VITE_PRODUCTS_API_URL || '/api/products'
    const url = buildApiUrl(apiUrl, {
      limit: typeof limit === 'number' ? String(limit) : null,
      cursor: cursor || null,
    })

    const response = await fetchWithRetry(url, { headers: { accept: 'application/json' } }, 3)
    const responseText = await response.text()

    if (!response.ok) {
      let errorMsg = `Failed to fetch products: ${response.status} ${response.statusText}`
      if (responseText && responseText.trim()) {
        try {
          const data = JSON.parse(responseText)
          errorMsg = data.error || data.message || errorMsg
        } catch {
          errorMsg = responseText || errorMsg
        }
      }
      throw new Error(errorMsg)
    }

    if (!responseText || !responseText.trim()) {
      throw new Error('Empty response from API')
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      throw new Error(`Invalid JSON response from API: ${errorMsg}`)
    }

    const productsRaw = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []
    const nextCursor = typeof data?.nextCursor === 'string' ? data.nextCursor : null
    const sanitized = sanitizeBatch(productsRaw)

    // Best-effort local cache merge so subsequent loads can start from cached data.
    if (sanitized.length > 0) {
      const existing = readCachedProducts() || []
      const seen = new Set(existing.map(p => p.id))
      const merged = existing.concat(sanitized.filter(p => !seen.has(p.id)))
      writeCachedProducts(merged)
    }

    return { products: sanitized, nextCursor }
  } catch (error) {
    void error
    // If this is the first page and we have a cache, return it.
    if (!cursor) {
      const cached = readCachedProducts()
      if (cached && cached.length > 0) return { products: cached, nextCursor: null }
    }
    return { products: [], nextCursor: null }
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
    soldCount: Math.max(0, Math.round(coerceNumber(product.soldCount, 0, 0))),
    lastSoldAt: product.lastSoldAt ? sanitizeText(product.lastSoldAt, { maxLength: 80 }) : null,
    lastStockedAt: product.lastStockedAt ? sanitizeText(product.lastStockedAt, { maxLength: 80 }) : null,
    lastAdjustmentAt: product.lastAdjustmentAt ? sanitizeText(product.lastAdjustmentAt, { maxLength: 80 }) : null,
    createdAt: product.createdAt ? sanitizeText(product.createdAt, { maxLength: 80 }) : null,
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
