export interface ECSMoney {
  amount?: number | bigint | null;
  currency?: string | null;
}

export interface ECSCatalogVariation {
  id: string;
  itemVariationData?: {
    name?: string;
    priceMoney?: ECSMoney;
    sku?: string | null;
    trackInventory?: boolean | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ECSCatalogObject {
  id: string;
  type?: string;
  itemData?: {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    variations: ECSCatalogVariation[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ECSInventoryCount {
  catalogObjectId: string;
  state?: string;
  locationId?: string;
  quantity?: string;
  calculatedAt?: string;
  [key: string]: any;
}

export interface FormattedProduct {
  id: string;
  name: string;
  description?: string;
  image?: string;
  makers?: string[];
  genres?: string[];
  price?: number;
  variations: ECSCatalogVariation[];
  [key: string]: any;
}


