import type { SquareCatalogObject, FormattedProduct, SquareItemVariation } from '@/lib/types/square';

// Turn a product name into a URL-friendly slug (for display/SEO)
// Note: We actually use Square IDs in URLs, not slugs
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
    .replace(/(^-|-$)/g, '');      // Remove leading/trailing dashes
}

// Get the product name, or a fallback if it's missing
export function getProductName(product: SquareCatalogObject): string {
  return product?.itemData?.name || 'Unnamed Product';
}

// Parse product name into artist and album based on naming convention:
// Handles various formats:
// - "Artist - Album Name" (correct format)
// - "Artist -Album Name" (space before dash, no space after)
// - "Artist- Album Name" (no space before, space after)
// - "Artist-Album Name" (no spaces)
// - "Artist - Album Name [tag]" (with tag at end)
// - "Album Name" (no dash, no artist)
export function parseProductName(name: string): { artist: string | null; album: string } {
  // First, remove tags at the end (e.g., "[tag]", "(tag)", etc.)
  // Match brackets or parentheses with content at the end
  let cleanedName = name.trim().replace(/\s*[\[\(][^\])]+[\]\)]\s*$/, '').trim();
  
  // Look for dash with any spacing: " - ", " -", "- ", or "-"
  // Use regex to find dash with optional spaces around it
  const dashMatch = cleanedName.match(/\s*-\s*/);
  
  if (!dashMatch) {
    // No dash means no artist, just album name
    return {
      artist: null,
      album: cleanedName,
    };
  }
  
  // Find the position of the dash
  const dashIndex = cleanedName.indexOf(dashMatch[0]);
  
  // Split into artist and album
  const artist = cleanedName.substring(0, dashIndex).trim();
  const album = cleanedName.substring(dashIndex + dashMatch[0].length).trim();
  
  return {
    artist: artist || null,
    album: album || cleanedName, // Fallback to full name if album is empty
  };
}

// Extract price from the first variation (Square stores prices in cents)
export function getProductPrice(product: SquareCatalogObject): number | null {
  const variations = product?.itemData?.variations || [];
  const firstVariation = variations[0];
  const priceMoney = firstVariation?.itemVariationData?.priceMoney;
  
  if (!priceMoney?.amount) return null;
  
  // Square sometimes returns bigint, sometimes string - handle both
  const amount = typeof priceMoney.amount === 'bigint' 
    ? Number(priceMoney.amount) 
    : Number(priceMoney.amount);
  
  // Convert cents to dollars
  return amount / 100;
}

// Get the first product image from Square's CDN
// Images can be in imageIds array or in relatedObjects
export function getProductImage(
  product: SquareCatalogObject,
  relatedObjects?: any[]
): string | null {
  const imageIds = product?.itemData?.imageIds || [];
  if (imageIds.length === 0) return null;
  
  const firstImageId = imageIds[0];
  
  // First, try to find the image in relatedObjects (if provided)
  if (relatedObjects) {
    const imageObject = relatedObjects.find(
      (obj: any) => obj.type === 'IMAGE' && obj.id === firstImageId
    );
    
    // Square IMAGE objects have imageData with url
    if (imageObject?.imageData?.url) {
      return imageObject.imageData.url;
    }
  }
  
  // Fallback: construct Square CDN URL from image ID
  // Square CDN pattern: https://square-cdn.com/{imageId}/original.jpg
  return `https://square-cdn.com/${firstImageId}/original.jpg`;
}

// Serialize variations to handle BigInt values in price amounts
function serializeVariations(variations: SquareItemVariation[]): any[] {
  return variations.map(variation => {
    if (variation.itemVariationData?.priceMoney?.amount) {
      const amount = variation.itemVariationData.priceMoney.amount;
      return {
        ...variation,
        itemVariationData: {
          ...variation.itemVariationData,
          priceMoney: {
            ...variation.itemVariationData.priceMoney,
            amount: typeof amount === 'bigint' ? Number(amount) : Number(amount),
          },
        },
      };
    }
    return variation;
  });
}

// Get category name from product (if available in itemData)
// Note: Square returns categoryId, but we may need to fetch category separately
// For now, we'll store the categoryId and let the API handle category lookup if needed
export function getProductCategory(product: SquareCatalogObject): string | null {
  // Square stores category as an ID reference, not the name directly
  // We'll need to look up categories separately or store them in a map
  // For now, return null - category lookup can be added later if needed
  return product?.itemData?.categoryId || null;
}

// Convert a raw Square catalog object into our formatted product format
// We use Square IDs in URLs but generate slugs for display/SEO purposes
export function formatProduct(
  product: SquareCatalogObject,
  categoryMap?: Map<string, string>,  // Optional map of categoryId -> categoryName
  relatedObjects?: any[],  // Optional related objects (for images, categories, etc.)
  inventoryMap?: Map<string, number>  // Optional map of variationId -> stock count
): FormattedProduct {
  const name = getProductName(product);
  const { artist, album } = parseProductName(name);
  
  // Square uses categories array, not categoryId
  // Get the first category ID from the array, or fall back to categoryId for backwards compatibility
  const categoryId = product?.itemData?.categories?.[0]?.id 
    || product?.itemData?.categoryId 
    || null;
  
  const category = categoryId && categoryMap ? categoryMap.get(categoryId) || null : null;
  
  // Calculate total stock from all variations
  let totalStock: number | null = null;
  if (inventoryMap && product?.itemData?.variations) {
    const stockCounts = product.itemData.variations
      .map(v => inventoryMap.get(v.id))
      .filter((count): count is number => count !== undefined);
    
    if (stockCounts.length > 0) {
      totalStock = stockCounts.reduce((sum, count) => sum + count, 0);
    }
  }
  
  return {
    id: product.id,                    // Square ID - this is what we use in URLs
    slug: generateSlug(name),          // Generated slug for display/SEO
    name,                               // Full name (for backwards compatibility)
    artist,                             // Parsed artist (null if no artist)
    album,                              // Parsed album name
    price: getProductPrice(product),
    image: getProductImage(product, relatedObjects),  // Pass relatedObjects for image lookup
    description: product?.itemData?.description || null,
    categoryId,                         // Square category ID
    category,                           // Category name (if categoryMap provided)
    productType: product?.itemData?.productType || 'REGULAR',
    stock: totalStock,                  // Total inventory count
    variations: serializeVariations(product?.itemData?.variations || []),  // Serialize BigInt in variations
  };
}

// Format a whole array of products
export function formatProducts(
  products: SquareCatalogObject[],
  categoryMap?: Map<string, string>,  // Optional map of categoryId -> categoryName
  relatedObjects?: any[],  // Optional related objects (for images, categories, etc.)
  inventoryMap?: Map<string, number>  // Optional map of variationId -> stock count
): FormattedProduct[] {
  return products.map(product => formatProduct(product, categoryMap, relatedObjects, inventoryMap)) as FormattedProduct[];
}

