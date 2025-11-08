// Analytics helper functions for Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
  }
}

export function trackEvent(eventName: string, props?: Record<string, string>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
}

export function trackAddToCart(productTitle: string) {
  trackEvent('add_to_cart', { product: productTitle });
}

export function trackCheckoutDemo() {
  trackEvent('checkout_demo');
}

export function trackNewsletterSignup() {
  trackEvent('newsletter_signup');
}

export function trackGetTickets(eventTitle: string) {
  trackEvent('get_tickets', { event: eventTitle });
}

