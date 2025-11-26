/**
 * Type definitions for Square API responses
 */

export interface SquareCatalogObject {
  id: string;
  type: string;
  itemData?: {
    name?: string;
    description?: string;
    categoryId?: string;  // Legacy field (deprecated by Square)
    categories?: Array<{ id: string; ordinal?: number }>;  // Square now uses this array
    productType?: string;
    variations?: SquareItemVariation[];
    imageIds?: string[];
  };
}

export interface SquareItemVariation {
  id: string;
  type: string;
  itemVariationData?: {
    name?: string;
    priceMoney?: {
      amount: bigint | string | number;  // Can be BigInt, string, or number after serialization
      currency: string;
    };
    sku?: string;
    trackInventory?: boolean;
  };
}

export interface SquareInventoryCount {
  catalogObjectId: string;
  catalogObjectType?: string;
  state?: string;
  locationId?: string;
  quantity?: string;
  calculatedAt?: string;
}

export interface SquareOrder {
  id: string;
  locationId: string;
  referenceId?: string;
  state?: string;
  lineItems?: SquareOrderLineItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SquareOrderLineItem {
  uid?: string;
  name?: string;
  quantity: string;
  catalogObjectId?: string;
  basePriceMoney?: {
    amount: bigint | string;
    currency: string;
  };
}

export interface SquareLocation {
  id: string;
  name?: string;
  address?: {
    addressLine1?: string;
    locality?: string;
    administrativeDistrictLevel1?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Formatted product type (for API responses)
 * Note: raw property is excluded to avoid BigInt serialization issues
 */
export interface FormattedProduct {
  id: string;
  slug: string;
  name: string;
  artist: string | null;  // Parsed from name (if "Artist - Album" format)
  album: string;           // Parsed from name (album name or full name if no artist)
  price: number | null;
  image: string | null;
  description: string | null;
  categoryId: string | null;
  category: string | null;  // Category name (from Square category)
  productType: string;
  stock: number | null;  // Total inventory count across all variations
  variations: Array<{
    id: string;
    type: string;
    itemVariationData?: {
      name?: string;
      priceMoney?: {
        amount: number;  // Always a number after serialization
        currency: string;
      };
      sku?: string;
      trackInventory?: boolean;
    };
  }>;
}

