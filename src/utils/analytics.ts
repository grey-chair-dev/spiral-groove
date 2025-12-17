/**
 * Google Analytics 4 (GA4) integration
 * 
 * To enable analytics, set VITE_GA4_MEASUREMENT_ID in your environment variables.
 * Example: VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 */
export function initAnalytics() {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') {
    return;
  }

  // Create dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize GA4
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page views
 */
export function trackPageView(path: string) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: path,
  });
}

/**
 * Track custom events
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', eventName, eventParams);
}

/**
 * Track ecommerce events
 */
export function trackPurchase(orderId: string, value: number, currency: string = 'USD', items?: any[]) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: value,
    currency: currency,
    items: items,
  });
}

/**
 * Track add to cart events
 */
export function trackAddToCart(productId: string, productName: string, value: number) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: value,
    items: [{
      item_id: productId,
      item_name: productName,
      price: value,
      quantity: 1,
    }],
  });
}
