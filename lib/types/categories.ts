/**
 * Product categories for Spiral Groove Records
 * Based on Square catalog categories
 */

export enum ProductCategory {
  // Main Categories
  UNCATEGORIZED = 'Uncategorized',
  NEW_33 = '33New',
  USED_33 = '33Used',
  FORTY_FIVE = '45',
  
  // Media Formats
  CASSETTES = 'Cassettes',
  CDS = "CD's",
  DVDS = "DVD's",
  VHS = 'VHS',
  NEW_VINYL = 'New Vinyl',
  USED_VINYL = 'Used Vinyl',
  
  // Music Genres
  BLUEGRASS = 'Bluegrass',
  BLUES = 'Blues',
  COMPILATIONS = 'Compilations',
  COUNTRY = 'Country',
  ELECTRONIC = 'Electronic',
  FOLK = 'Folk',
  FUNK_SOUL = 'Funk/Soul',
  INDIE = 'Indie',
  INDUSTRIAL = 'Industrial',
  JAZZ = 'Jazz',
  METAL = 'Metal',
  POP = 'Pop',
  PUNK_SKA = 'Punk/Ska',
  RAP_HIP_HOP = 'Rap/Hip-Hop',
  REGGAE = 'Reggae',
  ROCK = 'Rock',
  SINGER_SONGWRITER = 'Singer Songwriter',
  SOUNDTRACKS = 'Soundtracks',
  OTHER = 'Other',
  
  // Collectibles & Toys
  ACTION_FIGURES = 'Action Figures',
  FUNKO_POP = 'Funko Pop',
  ANIMALS_MINIS = 'Animals (Minis)',
  
  // Accessories & Merchandise
  ADAPTERS = 'Adapters',
  BUTTONS = 'Buttons',
  CANDLES = 'Candles',
  CLEANER = 'Cleaner',
  COASTERS = 'Coasters',
  COFFEE_MUG = 'Coffee Mug',
  CRATES = 'Crates',
  EQUIPMENT = 'Equipment',
  GUITAR_PICKS = 'Guitar picks',
  HATS = 'Hats',
  JEWELRY = 'Jewelry',
  PATCHES = 'Patches',
  PIN = 'Pin',
  POSTER = 'Poster',
  SLEEVES = 'Sleeves',
  SLIP_MAT = 'Slip Mat',
  SPIN_CLEAN = 'Spin Clean',
  STICKER = 'Sticker',
  T_SHIRTS = 'T-Shirts',
  TOTE_BAG = 'Tote Bag',
  WALLETS = 'Wallets',
  WRISTBAND = 'Wristband',
  
  // Other Items
  BOOK = 'Book',
  BOOMBOX = 'Boombox',
  BOWL = 'Bowl',
  BOX_SET = 'Box Set',
  DRINKS = 'Drinks',
  FOOD = 'Food',
  INCENSE = 'Incense',
  CHARMS = 'Charms',
  SPROUTS = 'Sprouts',
  LAVA_LAMPS = 'Lava Lamps',
  ESSENTIAL_OILS = 'Essential Oils',
  PUZZLE = 'Puzzle',
  RECORD_STORE_DAY = 'Record Store Day',
  VIDEOGAMES = 'Videogames',
  MISCELLANEOUS = 'Miscellaneous',
}

/**
 * Category groups for filtering/organization
 */
export const CategoryGroups: Record<string, ProductCategory[]> = {
    VINYL: [
        ProductCategory.NEW_VINYL,
        ProductCategory.USED_VINYL,
        ProductCategory.NEW_33,
        ProductCategory.USED_33,
        ProductCategory.FORTY_FIVE,
      ],
      
      MEDIA: [
        ProductCategory.CASSETTES,
        ProductCategory.CDS,
        ProductCategory.DVDS,
        ProductCategory.VHS,
      ],
      
      GENRES: [
        ProductCategory.BLUEGRASS,
        ProductCategory.BLUES,
        ProductCategory.COMPILATIONS,
        ProductCategory.COUNTRY,
        ProductCategory.ELECTRONIC,
        ProductCategory.FOLK,
        ProductCategory.FUNK_SOUL,
        ProductCategory.INDIE,
        ProductCategory.INDUSTRIAL,
        ProductCategory.JAZZ,
        ProductCategory.METAL,
        ProductCategory.POP,
        ProductCategory.PUNK_SKA,
        ProductCategory.RAP_HIP_HOP,
        ProductCategory.REGGAE,
        ProductCategory.ROCK,
        ProductCategory.SINGER_SONGWRITER,
        ProductCategory.SOUNDTRACKS,
        ProductCategory.OTHER,
      ],
      
      COLLECTIBLES: [
        ProductCategory.ACTION_FIGURES,
        ProductCategory.FUNKO_POP,
        ProductCategory.ANIMALS_MINIS,
        ProductCategory.CHARMS,
        ProductCategory.PIN,
        ProductCategory.PATCHES,
        ProductCategory.BUTTONS,
        ProductCategory.WRISTBAND,
        ProductCategory.JEWELRY,
      ],
      
      ACCESSORIES: [
        ProductCategory.GUITAR_PICKS,
        ProductCategory.SLEEVES,
        ProductCategory.SLIP_MAT,
        ProductCategory.SPIN_CLEAN,
        ProductCategory.CLEANER,
        ProductCategory.CRATES,
        ProductCategory.WALLETS,
        ProductCategory.TOTE_BAG,
        ProductCategory.T_SHIRTS,
        ProductCategory.HATS,
        ProductCategory.STICKER,
        ProductCategory.POSTER,
        ProductCategory.COFFEE_MUG,
        ProductCategory.COASTERS,
      ],
      
      ELECTRONICS: [
        ProductCategory.EQUIPMENT,
        ProductCategory.ADAPTERS,
        ProductCategory.BOOMBOX,
      ],
      
      HOME_LIFESTYLE: [
        ProductCategory.CANDLES,
        ProductCategory.INCENSE,
        ProductCategory.ESSENTIAL_OILS,
        ProductCategory.LAVA_LAMPS,
        ProductCategory.BOWL,
      ],
      
      FOOD_DRINK: [
        ProductCategory.FOOD,
        ProductCategory.DRINKS,
      ],
      
      BOOKS_MEDIA: [
        ProductCategory.BOOK,
        ProductCategory.BOX_SET,
        ProductCategory.PUZZLE,
        ProductCategory.VIDEOGAMES,
      ],
      
      EVENTS: [
        ProductCategory.RECORD_STORE_DAY, // optional but real group
      ],
      
      UNCATEGORIZED: [
        ProductCategory.SPROUTS,
        ProductCategory.MISCELLANEOUS,
        ProductCategory.UNCATEGORIZED,
      ],
};

/**
 * Get all category values as an array
 */
export function getAllCategories(): string[] {
  return Object.values(ProductCategory);
}

/**
 * Check if a string is a valid category
 */
export function isValidCategory(category: string): boolean {
  return Object.values(ProductCategory).includes(category as ProductCategory);
}

/**
 * Get category group for a given category
 */
export function getCategoryGroup(category: string): string | null {
  for (const [groupName, categories] of Object.entries(CategoryGroups)) {
    if (categories.includes(category as ProductCategory)) {
      return groupName;
    }
  }
  return null;
}

