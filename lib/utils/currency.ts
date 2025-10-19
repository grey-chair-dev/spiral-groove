/**
 * Currency formatting utilities
 */

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatPriceRange(min: number, max: number, currency: string = 'USD'): string {
  if (min === max) {
    return formatPrice(min, currency);
  }
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}

export function parsePrice(priceString: string): number {
  // Remove currency symbols and parse as float
  const cleaned = priceString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}
