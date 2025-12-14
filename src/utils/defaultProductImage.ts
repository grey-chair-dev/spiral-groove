/**
 * Default product image - Record/Disc icon
 * Used when products don't have an image URL
 */

/**
 * Returns a data URI for a default record/disc icon
 * This is a minimalist, monochromatic disc icon with sound wave lines
 */
export function getDefaultProductImage(): string {
  // SVG of a record/disc icon with sound waves
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle (disc) -->
      <circle cx="200" cy="200" r="180" fill="#ffffff" stroke="#d1d5db" stroke-width="2"/>
      
      <!-- Inner label circle -->
      <circle cx="200" cy="200" r="80" fill="#9ca3af"/>
      
      <!-- Spindle hole -->
      <circle cx="200" cy="200" r="8" fill="#ffffff"/>
      
      <!-- Sound wave lines - upper left -->
      <path d="M 120 120 Q 100 100, 80 80" stroke="#9ca3af" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 130 130 Q 110 110, 90 90" stroke="#9ca3af" stroke-width="8" fill="none" stroke-linecap="round"/>
      
      <!-- Sound wave lines - lower right -->
      <path d="M 280 280 Q 300 300, 320 320" stroke="#9ca3af" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 270 270 Q 290 290, 310 310" stroke="#9ca3af" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>
  `.trim();
  
  // Convert to data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Returns the product image URL, or default if missing/invalid
 */
export function getProductImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null' || imageUrl === 'undefined') {
    return getDefaultProductImage();
  }
  
  // Check if it's a valid URL
  try {
    const url = new URL(imageUrl);
    // If it's a valid URL, return it
    return imageUrl;
  } catch {
    // If not a valid URL, return default
    return getDefaultProductImage();
  }
}


