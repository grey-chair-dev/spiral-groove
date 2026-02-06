/**
 * Google Analytics 4 (GA4) Event Tracking
 * 
 * Provides helper functions for tracking pageviews and events.
 * Configure with VITE_GA4_MEASUREMENT_ID environment variable.
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-7VV4DCV276'

/**
 * Initialize Google Analytics 4
 * Note: GA4 script is loaded in index.html, this just ensures gtag is available
 */
export function initAnalytics() {
  // Ensure gtag function exists (it's loaded in index.html)
  if (typeof window.gtag === 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.gtag = function(...args: any[]) {
      ;(window.dataLayer ||= []).push(args)
    }
  }
}

/**
 * Track a pageview
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!window.gtag) return

  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  })
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!window.gtag) return

  window.gtag('event', eventName, eventParams)
}

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string
  name: string
  price?: number
  category?: string
  brand?: string
}) {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Unknown',
        item_brand: product.brand || 'Spiral Groove Records',
        price: product.price || 0,
        quantity: 1,
      },
    ],
  })
}

/**
 * Track add to cart
 */
export function trackAddToCart(item: {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  brand?: string
}) {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || 'Unknown',
        item_brand: item.brand || 'Spiral Groove Records',
        price: item.price,
        quantity: item.quantity,
      },
    ],
  })
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(item: {
  id: string
  name: string
  price: number
  quantity: number
}) {
  trackEvent('remove_from_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  })
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(items: Array<{
  id: string
  name: string
  price: number
  quantity: number
  category?: string
}>, value: number) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: value,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || 'Unknown',
      price: item.price,
      quantity: item.quantity,
    })),
  })
}

/**
 * Track purchase completion
 */
export function trackPurchase(order: {
  transaction_id: string
  value: number
  tax?: number
  shipping?: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category?: string
  }>
}) {
  trackEvent('purchase', {
    transaction_id: order.transaction_id,
    value: order.value,
    tax: order.tax || 0,
    shipping: order.shipping || 0,
    currency: 'USD',
    items: order.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || 'Unknown',
      price: item.price,
      quantity: item.quantity,
    })),
  })
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  trackEvent('search', {
    search_term: searchTerm,
  })
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source?: string) {
  trackEvent('newsletter_signup', {
    source: source || 'website',
  })
}

/**
 * Track user signup
 */
export function trackSignup(method?: string) {
  trackEvent('sign_up', {
    method: method || 'email',
  })
}

/**
 * Track login
 */
export function trackLogin(method?: string) {
  trackEvent('login', {
    method: method || 'email',
  })
}

