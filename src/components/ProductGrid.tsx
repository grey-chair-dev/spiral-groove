
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { Plus, Sparkles, Filter, Disc, ChevronLeft, ChevronRight, ChevronDown, Check, DollarSign, Mic2, X, SlidersHorizontal, ArrowUpDown, Tag } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { ViewMode } from '../../types';
import { CategoryGroups, getFormatDisplayName, isNonProductStyleCategory, isProductStyleCategory, RecordFormat } from '../types/productEnums';
import { getDefaultProductImage } from '../utils/defaultProductImage';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  viewMode: ViewMode;
  initialFilter?: string;
  initialArtist?: string;
  onViewCatalog?: () => void;
  onViewMore?: () => void;
  onFilterChange?: (filter: string) => void;
  showFilters?: boolean;
  compact?: boolean;
  limit?: number;
}

const QUICK_FILTERS = ["All", "New Arrivals", "On Sale", "Bargain Bin", "Clearance"] as const;

// Category filter should be record format only (per productEnums.ts)
const FORMAT_FILTERS: RecordFormat[] = [
  RecordFormat.VINYL,
  RecordFormat.LP,
  RecordFormat.TWELVE_INCH,
  RecordFormat.SEVEN_INCH,
  RecordFormat.TEN_INCH,
  RecordFormat.CD,
  RecordFormat.CASSETTE,
  RecordFormat.REEL_TO_REEL,
  RecordFormat.BOX_SET,
  RecordFormat.DIGITAL,
];

// Genres sourced from productEnums.ts (lines ~68-87)
const GENRE_FILTERS = CategoryGroups.GENRES;

const PRICE_RANGES = [
  { label: 'Any Price', value: 'all' },
  { label: 'Under $25', value: 'under-25' },
  { label: '$25 - $50', value: '25-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: '$100+', value: 'over-100' },
];

type SortOption = 'featured' | 'release-date' | 'price-asc' | 'price-desc' | 'title-asc' | 'artist-asc';

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onProductClick, 
  onQuickAdd, 
  viewMode, 
  initialFilter, 
  initialArtist,
  onViewCatalog,
  onViewMore,
  onFilterChange,
  showFilters = true,
  compact = false,
  limit
}) => {
  const [isWide, setIsWide] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 760 : false));

  // Multi-filter (independent) state:
  // - Browse: quick “collection” toggles (one selected)
  // - Record Format: one selected
  // - Genre: one selected
  const [activeBrowse, setActiveBrowse] = useState<string>(QUICK_FILTERS.includes((initialFilter as any)) ? (initialFilter as string) : "All");
  const [activeFormat, setActiveFormat] = useState<RecordFormat | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string>('all');
  // Legacy single filter (kept for backwards compatibility with existing links like Equipment/Merch/etc.)
  const [legacyFilter, setLegacyFilter] = useState<string | null>(null);
  const [activeArtist, setActiveArtist] = useState(initialArtist || "All");
  const [activePriceRange, setActivePriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [itemsPerPage, setItemsPerPage] = useState(compact ? 99 : 12);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Unified Dropdown States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsWide(window.innerWidth >= 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  const pageSizeOptions = useMemo(() => {
    return [6, 12, 24, 48];
  }, []);

  useEffect(() => {
    if (initialFilter) {
      // Supports:
      // - Single value (e.g. "Rock", "LP", "New Arrivals", "Equipment")
      // - Querystring-like combined filters (e.g. "b=On%20Sale&f=LP&g=Rock")
      const parseCombined = (raw: string) => {
        if (!raw.includes('=')) return null;
        const params = new URLSearchParams(raw);
        const b = params.get('b') || 'All';
        const f = params.get('f') || 'all';
        const g = params.get('g') || 'all';
        const c = params.get('c'); // legacy category
        return { b, f, g, c };
      };

      const combined = parseCombined(initialFilter);
      if (combined) {
        setActiveBrowse(combined.b);
        setActiveFormat((combined.f === 'all' ? 'all' : (combined.f as RecordFormat)));
        setActiveGenre(combined.g);
        setLegacyFilter(combined.c || null);
      } else {
        // Reset multi-filters, then apply best match
        setActiveBrowse("All");
        setActiveFormat('all');
        setActiveGenre('all');
        setLegacyFilter(null);

        if (QUICK_FILTERS.includes(initialFilter as any)) {
          setActiveBrowse(initialFilter);
        } else if (FORMAT_FILTERS.map(f => f.toString()).includes(initialFilter)) {
          setActiveFormat(initialFilter as RecordFormat);
        } else if (GENRE_FILTERS.map(g => g.toString()).includes(initialFilter)) {
          setActiveGenre(initialFilter);
        } else {
          // Legacy (Equipment/Merch/etc or other catalog tokens)
          setLegacyFilter(initialFilter);
        }
      }

      setCurrentPage(1); // Reset page on filter change
    }
  }, [initialFilter]);

  useEffect(() => {
    if (initialArtist) {
      setActiveArtist(initialArtist);
      setCurrentPage(1); // Reset page on artist change
    }
  }, [initialArtist]);

  const serializeCatalogFilters = (next?: Partial<{
    b: string;
    f: RecordFormat | 'all';
    g: string;
    c: string | null;
  }>) => {
    const b = next?.b ?? activeBrowse;
    const f = next?.f ?? activeFormat;
    const g = next?.g ?? activeGenre;
    const c = next?.c ?? legacyFilter;

    // If everything is default, keep it simple for backwards compatibility.
    if ((b === 'All' || !b) && f === 'all' && (g === 'all' || !g) && !c) return 'All';

    const params = new URLSearchParams();
    if (b && b !== 'All') params.set('b', b);
    if (f && f !== 'all') params.set('f', f);
    if (g && g !== 'all') params.set('g', g);
    if (c) params.set('c', c);
    return params.toString();
  };

  const emitFilterChange = (next?: Parameters<typeof serializeCatalogFilters>[0]) => {
    if (!onFilterChange) return;
    onFilterChange(serializeCatalogFilters(next));
  };

  const handleBrowseUpdate = (newBrowse: string) => {
    setActiveBrowse(newBrowse);
    setLegacyFilter(null); // browse is a primary catalog mode; clear legacy token
    setCurrentPage(1);
    emitFilterChange({ b: newBrowse, c: null });
  };

  const handleFormatUpdate = (newFormat: RecordFormat | 'all') => {
    setActiveFormat(newFormat);
    setLegacyFilter(null);
    setCurrentPage(1);
    emitFilterChange({ f: newFormat, c: null });
  };

  const handleGenreUpdate = (newGenre: string) => {
    setActiveGenre(newGenre);
    setLegacyFilter(null);
    setCurrentPage(1);
    emitFilterChange({ g: newGenre, c: null });
  };

  // Generate unique artists list
  const uniqueArtists = useMemo(() => {
    const artists = new Set(products.map(p => p.artist));
    return ["All", ...Array.from(artists).sort()];
  }, [products]);

  // 1. Filter
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category Logic
    // Apply multi-filters: Browse + Format + Genre (+ legacy token)
    const vinylKeywords = ['vinyl', '33', '45', 'lp', 'record', 'compilation', 'box set', 'record store day', '12"', '7"', '10"', '2xlp'];
    const equipmentKeywords = ['equipment', 'turntable', 'cleaner', 'cleaning', 'sleeve', 'slip mat', 'adapter', 'crate', 'storage', 'boombox', 'spin clean'];
    const merchKeywords = [
      'merch', 'shirt', 'hat', 'tote', 'candle', 'toy', 'figure', 'poster', 'pin', 'sticker',
      'mug', 'patch', 'incense', 'mat', 'wallet', 'button', 'puzzle', 'game', 'funko', 'action figure',
      'coasters', 'drinks', 'guitar picks', 'wristband', 'jewelry', 'animals', 'essential oils', 'lava lamps', 'sprouts'
    ];
    const apparelKeywords = ['shirt', 'hat', 'hoodie', 'apparel', 'wristband'];
    const collectiblesKeywords = ['funko', 'pop', 'figure', 'toy', 'collectible', 'action figures'];
    const homeKeywords = ['candle', 'mug', 'poster', 'incense', 'bowl', 'coasters', 'lava lamps'];

    // 1) Browse
    if (activeBrowse === "New Arrivals") result = result.filter(p => p.isNewArrival);
    if (activeBrowse === "On Sale") result = result.filter(p => p.onSale === true);
    if (activeBrowse === "Bargain Bin") result = result.filter(p => (p.tags || []).some(t => t.toLowerCase().includes('bargain')));
    if (activeBrowse === "Clearance") result = result.filter(p => (p.tags || []).some(t => t.toLowerCase().includes('clearance')));

    // 2) Legacy single token (Equipment/Merch/Apparel/etc). Kept for existing deep-links.
    if (legacyFilter) {
      const lf = legacyFilter.toLowerCase();
      result = result.filter(product => {
        const pGenre = (product.genre || '').toLowerCase();
        const pFormat = (product.format || '').toLowerCase();
        const pTitle = (product.title || '').toLowerCase();
        const pTags = product.tags?.map(t => t.toLowerCase()) || [];

        if (legacyFilter === "Equipment") return equipmentKeywords.some(k => pFormat.includes(k) || pTitle.includes(k) || pGenre.includes(k) || pTags.some(t => t.includes(k)));
        if (legacyFilter === "Merch") return merchKeywords.some(k => pFormat.includes(k) || pTitle.includes(k) || pGenre.includes(k) || pTags.some(t => t.includes(k)));
        if (legacyFilter === "Apparel") return apparelKeywords.some(k => pFormat.includes(k) || pTitle.includes(k) || pGenre.includes(k) || pTags.some(t => t.includes(k)));
        if (legacyFilter === "Collectibles") return collectiblesKeywords.some(k => pFormat.includes(k) || pTitle.includes(k) || pGenre.includes(k) || pTags.some(t => t.includes(k)));
        if (legacyFilter === "Home") return homeKeywords.some(k => pFormat.includes(k) || pTitle.includes(k) || pGenre.includes(k) || pTags.some(t => t.includes(k)));

        // fallback: generic token search
        return pGenre.includes(lf) || pFormat.includes(lf) || pTitle.includes(lf) || pTags.some(t => t.includes(lf));
      });
    }

    // 3) Record Format
    if (activeFormat !== 'all') {
      result = result.filter(product => {
        const pFormat = (product.format || '').toLowerCase();
        const pTitle = (product.title || '').toLowerCase();
        const pTags = product.tags?.map(t => t.toLowerCase()) || [];
        const haystack = [pFormat, pTitle, ...pTags].join(' ');

        switch (activeFormat) {
          case RecordFormat.VINYL:
            return vinylKeywords.some(k => haystack.includes(k));
          case RecordFormat.LP:
            return haystack.includes('lp');
          case RecordFormat.TWELVE_INCH:
            return haystack.includes('12"') || haystack.includes('12 inch');
          case RecordFormat.SEVEN_INCH:
            return haystack.includes('7"') || haystack.includes('7 inch') || haystack.includes('45');
          case RecordFormat.TEN_INCH:
            return haystack.includes('10"') || haystack.includes('10 inch');
          case RecordFormat.CD:
            return haystack.includes('cd');
          case RecordFormat.CASSETTE:
            return haystack.includes('cassette');
          case RecordFormat.REEL_TO_REEL:
            return haystack.includes('reel');
          case RecordFormat.BOX_SET:
            return haystack.includes('box set');
          case RecordFormat.DIGITAL:
            return haystack.includes('digital');
          default:
            return true;
        }
      });
    }

    // 4) Genre
    if (activeGenre !== 'all') {
      const search = activeGenre.toLowerCase();
      const genreAliasMap: Record<string, string[]> = {
        'rap/hip-hop': ['rap', 'hip hop', 'hip-hop'],
        'funk/soul': ['funk', 'soul', 'funk/soul'],
        'punk/ska': ['punk', 'ska', 'punk/ska'],
        'soundtracks': ['soundtrack', 'soundtracks'],
        'singer songwriter': ['singer songwriter', 'singer-songwriter'],
        'compilations': ['compilation', 'compilations'],
      };
      const aliases = genreAliasMap[search] || [search];
      result = result.filter(product => {
        const pGenre = (product.genre || '').toLowerCase();
        const pTitle = (product.title || '').toLowerCase();
        const pTags = product.tags?.map(t => t.toLowerCase()) || [];
        return aliases.some(a => pGenre.includes(a) || pTags.some(t => t.includes(a)) || pTitle.includes(a));
      });
    }

    // Artist Logic
    if (activeArtist !== "All") {
        result = result.filter(p => p.artist === activeArtist);
    }

    // Price Logic
    if (activePriceRange !== 'all') {
        result = result.filter(p => {
             const currentPrice = p.salePrice || p.price;
             if (activePriceRange === 'under-25') return currentPrice < 25;
             if (activePriceRange === '25-50') return currentPrice >= 25 && currentPrice < 50;
             if (activePriceRange === '50-100') return currentPrice >= 50 && currentPrice < 100;
             if (activePriceRange === 'over-100') return currentPrice >= 100;
             return true;
        });
    }

    return result;
  }, [products, activeBrowse, activeFormat, activeGenre, legacyFilter, activeArtist, activePriceRange]);

  // 2. Sort
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const getPrice = (p: Product) => p.salePrice || p.price;

    switch (sortBy) {
      case 'price-asc': return sorted.sort((a, b) => getPrice(a) - getPrice(b));
      case 'price-desc': return sorted.sort((a, b) => getPrice(b) - getPrice(a));
      case 'title-asc': return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist-asc': return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'release-date':
        return sorted.sort((a, b) => {
           if (a.releaseDate && b.releaseDate) return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
           return 0;
        });
      case 'featured':
      default:
        return sorted.sort((a, b) => {
           if (a.isNewArrival && !b.isNewArrival) return -1;
           if (!a.isNewArrival && b.isNewArrival) return 1;
           return 0;
        });
    }
  }, [filteredProducts, sortBy]);

  // 3. Paginate
  const totalPages = limit ? 1 : Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    if (limit) {
        return sortedProducts.slice(0, limit);
    }
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage, limit]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.inStock !== false) {
      onQuickAdd(product);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const getSectionTitle = () => {
    if (legacyFilter) return `${legacyFilter} Collection`;

    const parts: string[] = [];
    if (activeBrowse && activeBrowse !== 'All') {
      parts.push(activeBrowse === 'New Arrivals' ? 'Just Landed' : activeBrowse);
    }
    if (activeFormat !== 'all') parts.push(getFormatDisplayName(activeFormat));
    if (activeGenre !== 'all') parts.push(activeGenre);

    if (parts.length === 0) return "Full Catalog";
    return parts.join(' • ');
  };

  const getSortLabel = (key: SortOption) => {
    switch(key) {
        case 'featured': return 'Featured';
        case 'release-date': return 'Release Date';
        case 'price-asc': return 'Price: Low to High';
        case 'price-desc': return 'Price: High to Low';
        case 'title-asc': return 'Title: A-Z';
        case 'artist-asc': return 'Artist: A-Z';
    }
  };

  const clearAllFilters = () => {
      setActiveBrowse("All");
      setActiveFormat('all');
      setActiveGenre('all');
      setLegacyFilter(null);
      emitFilterChange({ b: 'All', f: 'all', g: 'all', c: null });
      setActiveArtist("All");
      setActivePriceRange("all");
      setCurrentPage(1);
  };

  const activeFilterCount =
    (activeBrowse !== "All" ? 1 : 0) +
    (activeFormat !== 'all' ? 1 : 0) +
    (activeGenre !== 'all' ? 1 : 0) +
    (legacyFilter ? 1 : 0) +
    (activeArtist !== "All" ? 1 : 0) +
    (activePriceRange !== "all" ? 1 : 0);

  // Determine if we should use product-style layout (square boxes) or non-product-style layout
  const shouldUseProductStyleLayout = useMemo(() => {
    // If "All" or special filters, check the actual products' categories
    if (activeBrowse === "All" || activeBrowse === "New Arrivals" || activeBrowse === "On Sale" || activeBrowse === "Bargain Bin" || activeBrowse === "Clearance") {
      if (filteredProducts.length === 0) return true; // Default to product style
      
      // Check if most products are from product-style categories
      // Products have category in tags[0] (from API mapping in App.tsx)
      const productStyleCount = filteredProducts.filter(p => {
        const category = p.tags?.[0] || '';
        return isProductStyleCategory(category);
      }).length;
      // If more than 50% are product-style, use product layout
      return productStyleCount > filteredProducts.length * 0.5;
    }
    
    // For specific filters, determine based on filter name
    // Product-style filters: Vinyl, Genres (Rock, Jazz, Hip Hop, etc.), Media formats
    const productStyleFilters = [
      ...FORMAT_FILTERS.map(f => f.toString()),
      ...GENRE_FILTERS.map(g => g.toString()),
    ];
    
    // Non-product-style filters: Equipment, Merch, Apparel, Collectibles, Home
    const nonProductStyleFilters = ["Equipment", "Merch", "Apparel", "Collectibles", "Home"];
    
    const chosen = legacyFilter || (activeFormat !== 'all' ? activeFormat : (activeGenre !== 'all' ? activeGenre : 'All'));

    if (chosen && nonProductStyleFilters.includes(chosen)) {
      return false;
    }
    
    // Default to product-style for genre/vinyl filters
    return productStyleFilters.includes(chosen) || true;
  }, [activeBrowse, activeFormat, activeGenre, legacyFilter, filteredProducts]);

  const Wrapper = compact ? 'div' : Section;

  return (
    <Wrapper viewMode={viewMode}>
      {/* Collection Header - Hide in compact mode */}
      {!compact && (
      <div className="flex flex-col gap-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-brand-black/10 pb-6">
          <div className="max-w-2xl">
            <h2 className={`font-display text-5xl md:text-6xl mb-4
              ${viewMode === 'retro' ? 'drop-shadow-[3px_3px_0px_#F35B04]' : 'tracking-tight'}
            `} style={{ color: 'var(--color-text)' }}>
               {getSectionTitle()}
            </h2>
            <p className={`font-medium text-lg leading-relaxed
               ${viewMode === 'retro' ? 'font-header' : ''}
            `} style={{ color: 'var(--color-text)' }}>
              The latest drops, restocks, and essential listening. Verified clean.
            </p>
          </div>
          <div className="hidden md:block pb-1">
            <Button 
                variant={viewMode === 'retro' ? 'secondary' : 'outline'} 
                size="md" 
                onClick={() => {
                  if (onViewCatalog) onViewCatalog();
                  clearAllFilters();
                }}
            >
              <span className="flex items-center gap-2">
                View All Inventory <Disc size={16} />
              </span>
            </Button>
          </div>
        </div>

        {/* Unified Sticky Toolbar */}
        {showFilters && (
        <div className="sticky top-[72px] z-[70] -mx-4 px-4 sm:mx-0 sm:px-0 pt-4 pb-4 overflow-y-visible overflow-x-clip">
          {/* Backdrop Blur Mask */}
          <div className={`absolute inset-0 pointer-events-none border-b shadow-sm transition-all
            ${viewMode === 'retro' ? 'border-brand-black/10' : 'border-gray-100'}
            backdrop-blur-md`} 
          />
          
          <div className="relative flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                {/* 1. UNIFIED FILTER DROPDOWN */}
                <div className="relative z-[80]">
                    <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    onBlur={(e) => {
                        // Small delay to allow clicking inside dropdown
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            // Don't close immediately if interacting with menu
                            // Just handled by click outside logic or specific item clicks ideally
                        }
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold uppercase tracking-wide text-[10px] sm:text-[11px] select-none transition-all
                        ${viewMode === 'retro'
                            ? (isFilterOpen ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-none translate-y-[2px]' : 'bg-white text-brand-black border-2 border-brand-black shadow-pop-sm hover:-translate-y-0.5')
                            : (isFilterOpen ? 'bg-black text-white shadow-inner' : 'bg-white text-black border border-gray-300 shadow-sm hover:bg-gray-50')}
                    `}
                    >
                        <SlidersHorizontal size={14} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className={`ml-1 flex items-center justify-center w-5 h-5 rounded-full text-[9px]
                                ${viewMode === 'retro' ? 'bg-brand-black text-white' : 'bg-white text-black'}
                            `}>
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* MEGA MENU DROPDOWN */}
                    {isFilterOpen && (
                        <div className={`absolute left-0 top-full mt-3 w-80 max-w-[90vw] flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-left z-[60]
                            ${viewMode === 'retro' 
                                ? 'bg-white border-2 border-brand-black shadow-retro' 
                                : 'bg-white border border-gray-200 rounded-xl shadow-xl'}
                        `}>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Filter By</span>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearAllFilters} className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 flex items-center gap-1">
                                        <X size={12} /> Clear All
                                    </button>
                                )}
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                                {/* Quick Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <Tag size={12} /> Browse
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_FILTERS.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => handleBrowseUpdate(filter)}
                                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-md transition-all
                                                    ${activeBrowse === filter
                                                        ? (viewMode === 'retro' ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black')
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                                                `}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Record Format Section (Category) */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <Filter size={12} /> Record Format
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {FORMAT_FILTERS.map((format) => (
                                            <button
                                                key={format}
                                                onClick={() => handleFormatUpdate(format)}
                                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-md transition-all
                                                    ${activeFormat === format
                                                        ? (viewMode === 'retro' ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black')
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                                                `}
                                            >
                                                {getFormatDisplayName(format)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Genres Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <Disc size={12} /> Genre
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRE_FILTERS.map((genre) => (
                                            <button
                                                key={genre}
                                                onClick={() => handleGenreUpdate(genre)}
                                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-md transition-all
                                                    ${activeGenre === genre
                                                        ? (viewMode === 'retro' ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black')
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                                                `}
                                            >
                                                {genre}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <DollarSign size={12} /> Price Range
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {PRICE_RANGES.map(range => (
                                            <label key={range.value} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                    ${activePriceRange === range.value ? 'border-brand-orange' : 'border-gray-300 group-hover:border-gray-400'}
                                                `}>
                                                    {activePriceRange === range.value && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="price" 
                                                    className="hidden" 
                                                    checked={activePriceRange === range.value}
                                                    onChange={() => setActivePriceRange(range.value)}
                                                />
                                                <span className={`text-xs font-bold uppercase tracking-wide ${activePriceRange === range.value ? 'text-black' : 'text-gray-500'}`}>
                                                    {range.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Artist Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                        <Mic2 size={12} /> Artist
                                    </div>
                                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
                                        {uniqueArtists.map(artist => (
                                            <button
                                                key={artist}
                                                onClick={() => setActiveArtist(artist)}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors rounded flex items-center justify-between
                                                    ${activeArtist === artist
                                                        ? 'bg-brand-orange/10 text-brand-black'
                                                        : 'hover:bg-gray-50 text-gray-600'}
                                                `}
                                            >
                                                {artist}
                                                {activeArtist === artist && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <Button size="sm" onClick={() => setIsFilterOpen(false)} fullWidth>
                                    View Results
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. SORT DROPDOWN */}
                <div className="relative z-[80]">
                    <button 
                       onClick={() => setIsSortOpen(!isSortOpen)}
                       onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setTimeout(() => setIsSortOpen(false), 100)}
                       className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold uppercase tracking-wide text-[10px] sm:text-[11px] select-none transition-all
                          ${viewMode === 'retro'
                            ? (isSortOpen ? 'bg-brand-mustard text-brand-black border-2 border-brand-black shadow-none translate-y-[2px]' : 'bg-white text-brand-black border-2 border-brand-black shadow-pop-sm hover:-translate-y-0.5')
                            : (isSortOpen ? 'bg-gray-100 text-black shadow-inner' : 'bg-white text-black border border-gray-300 shadow-sm hover:bg-gray-50')}
                       `}
                    >
                       <ArrowUpDown size={14} />
                       <span className="hidden sm:inline">{getSortLabel(sortBy)}</span>
                       <span className="sm:hidden">Sort</span>
                       <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSortOpen && (
                        <div className={`absolute left-0 top-full mt-3 w-48 flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-left z-[60]
                           ${viewMode === 'retro' 
                               ? 'bg-white border-2 border-brand-black shadow-retro' 
                               : 'bg-white border border-gray-200 rounded-xl shadow-xl'}
                        `}>
                            <div className="py-1">
                                {(['featured', 'release-date', 'price-asc', 'price-desc', 'title-asc', 'artist-asc'] as SortOption[]).map((option) => (
                                    <button 
                                        key={option} 
                                        onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                                        className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-colors
                                            ${sortBy === option 
                                                ? 'bg-gray-100 text-black' 
                                                : 'hover:bg-gray-50 text-gray-500'}
                                        `}
                                    >
                                        {getSortLabel(option)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count & Page Size (Right Side) */}
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
               <span className="hidden sm:inline">
                   {sortedProducts.length} Results
               </span>
               <div className="flex items-center gap-1">
                   <span>Show</span>
                   {pageSizeOptions.map(num => (
                      <button
                        key={num}
                        onClick={() => { setItemsPerPage(num); setCurrentPage(1); }}
                        className={`px-1.5 py-1 rounded transition-colors
                            ${itemsPerPage === num 
                                ? 'underline decoration-2 underline-offset-4' 
                                : 'hover:text-gray-600'}
                        `}
                        style={{ color: 'var(--color-text)' }}
                      >
                        {num}
                      </button>
                   ))}
               </div>
            </div>

          </div>
        </div>
        )}
      </div>
      )}

      {/* Product Grid - Split Layout */}
      {(() => {
        // Helper to determine if a product should be in the grid layout (Records/Media)
        // vs list layout (Equipment/Merch)
        const isGridItem = (p: Product) => {
             const tags = p.tags || [];
             
             // 1. If it has explicit non-product style tags (Merch, Equipment, etc.), it's a list item
             // We check this first so that even if a T-Shirt has a "Rock" tag (Genre), it's still treated as Merch
             if (tags.some(tag => isNonProductStyleCategory(tag))) return false;
             
             // 2. If it has explicit product style tags (Vinyl, CD, Genre), it's a grid item
             if (tags.some(tag => isProductStyleCategory(tag))) return true;

             // 3. Fallback: Check format for common media types
             if (['LP', '12"', '7"', '10"', 'CD', 'Cassette', 'Reel to Reel', 'Vinyl', '2xLP', 'Box Set'].includes(p.format)) return true;
             
             // Default to list if we can't determine (safest for unknown merch)
             return false;
        };

        // Split products into grid-style (Vinyl/Media) and list-style (Merch/Equipment)
        const gridItems = paginatedProducts.filter(isGridItem);
        const listItems = paginatedProducts.filter(p => !isGridItem(p));
        
        if (paginatedProducts.length === 0) {
            return (
                <div className="py-20 text-center bg-black/5 rounded-xl border-2 border-dashed border-black/10">
                  <div className="inline-block p-4 rounded-full bg-white mb-4 shadow-sm">
                    <Disc size={32} className="opacity-30" />
                  </div>
                  <h3 className="font-display text-2xl mb-2">No Items Found</h3>
                  <p className="text-gray-500 mb-6">We couldn't find any items matching your filters.</p>
                  {!compact && <Button variant="link" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>}
                </div>
            );
        }

        return (
            <div className="space-y-12">
                {/* 2. Grid Style Items (Vinyl, Media, Genres) */}
                {gridItems.length > 0 && (
                    <div>
                        {listItems.length > 0 && <h3 className="font-display text-xl mb-4 border-b border-gray-200 pb-2">Records & Media</h3>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 min-h-[100px]">
                            {gridItems.map((product, index) => {
                                const isSoldOut = product.inStock === false;
                                
                                // Responsive Hiding Logic (4 Mobile, 8 Tablet, 12 Desktop)
                                let hiddenClass = '';
                                if (limit && limit >= 8) {
                                    if (index >= 4 && index < 8) hiddenClass = 'hidden md:block'; // Show on tablet/desktop only
                                    if (index >= 8 && index < 12) hiddenClass = 'hidden lg:block'; // Show on desktop only (for 12 items)
                                }

                                return (
                                    <div 
                                      key={product.id} 
                                      className={`group cursor-pointer relative flex flex-col ${hiddenClass}`}
                                      onClick={() => onProductClick(product)}
                                    >
                                      {/* Image Container */}
                                      <div className="relative mb-4 aspect-square">
                                      
                                      {/* Album Cover */}
                                      <div className={`relative w-full h-full z-10 overflow-hidden bg-white transition-all duration-300 transform origin-bottom-left
                                        ${viewMode === 'retro' 
                                          ? 'rounded-none border-2 border-brand-black group-hover:-rotate-1' 
                                          : 'rounded-md'}
                                        ${isSoldOut ? 'opacity-80' : ''}
                                      `}>
                                        {/* ... Sold Out, Badges, Tags, Image ... */}
                                        {isSoldOut && (
                                          <div className={`absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[1px]
                                            ${viewMode === 'retro' ? 'bg-brand-cream/70' : 'bg-black/50'}
                                          `}>
                                             <div className={`px-4 py-3 border-2 text-sm font-bold uppercase tracking-[0.2em] transform -rotate-12 shadow-xl
                                               ${viewMode === 'retro' 
                                                 ? 'bg-brand-red text-white border-brand-black shadow-[4px_4px_0px_#231F20]' 
                                                 : 'bg-white text-black border-transparent rounded-sm'}
                                             `}>
                                               Sold Out
                                             </div>
                                          </div>
                                        )}
                                        {!isSoldOut && product.isNewArrival && (
                                          <div className="absolute top-0 left-0 z-20 transform -translate-x-1 -translate-y-1 sm:-translate-x-2 sm:-translate-y-2">
                                              <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg
                                                ${viewMode === 'retro' 
                                                  ? 'bg-brand-orange text-brand-black border-2 border-brand-black transform -rotate-3 hover-wobble shadow-pop-sm' 
                                                  : 'bg-black text-white rounded-sm shadow-md'}
                                              `}>
                                                <Sparkles size={12} className="mr-1.5 hidden sm:block" />
                                                New
                                              </span>
                                          </div>
                                        )}
                                        {!isSoldOut && !product.isNewArrival && product.onSale && (
                                          <div className="absolute top-0 left-0 z-20 transform -translate-x-1 -translate-y-1 sm:-translate-x-2 sm:-translate-y-2">
                                              <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg
                                                ${viewMode === 'retro' 
                                                  ? 'bg-brand-red text-white border-2 border-brand-black transform -rotate-3 hover-wobble shadow-pop-sm' 
                                                  : 'bg-red-600 text-white rounded-sm shadow-md'}
                                              `}>
                                                <Tag size={12} className="mr-1.5 hidden sm:block" />
                                                Sale
                                              </span>
                                          </div>
                                        )}
                                        {!isSoldOut && product.tags && product.tags.length > 0 && !product.tags[0].toLowerCase().includes('new vinyl') && (
                                          <div className="absolute top-2 right-2 z-20">
                                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md
                                                ${viewMode === 'retro' 
                                                  ? 'bg-brand-cream text-brand-black border-2 border-brand-black' 
                                                  : 'bg-white text-black border border-gray-200 rounded-full'}
                                              `}>
                                                {product.tags[0]}
                                              </span>
                                          </div>
                                        )}
                                        <img 
                                          src={product.coverUrl || getDefaultProductImage()} 
                                          alt={product.title} 
                                          className={`w-full h-full object-cover relative z-10 transition-all duration-500
                                            ${viewMode === 'retro' ? 'grayscale-[20%] group-hover:grayscale-0' : ''}
                                            ${isSoldOut ? 'grayscale contrast-125' : ''}
                                          `}
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = getDefaultProductImage();
                                          }}
                                        />
                                        {!viewMode && (
                                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>
                                        )}
                                      </div>
                                    </div>

                                      {/* Product Info */}
                                    <div className="flex flex-col flex-grow">
                                      <div className={`mb-1 ${isSoldOut ? 'opacity-50' : ''}`}>
                                         <h3 className={`font-bold text-sm sm:text-base leading-snug truncate transition-colors text-gray-500 group-hover:text-brand-orange group-focus:text-brand-orange
                                            ${viewMode === 'retro' ? 'font-header' : 'font-sans'}
                                         `}>
                                           {product.title}
                                         </h3>
                                         <p className="text-gray-500 group-hover:text-white group-focus:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors">{product.artist}</p>
                                      </div>
                                      
                                      {/* Footer Price & Add */}
                                      <div className={`mt-2 pt-3 border-t flex justify-between items-center gap-2
                                         ${viewMode === 'retro' ? 'border-brand-black/10' : 'border-gray-100'}
                                      `}>
                                        <div className="flex flex-col">
                                            {isSoldOut && <span className="text-[10px] font-bold uppercase text-brand-red tracking-wide leading-none mb-0.5">Sold Out</span>}
                                            
                                            {product.salePrice && !isSoldOut ? (
                                               <div className="flex flex-col gap-0.5">
                                                   <span className="text-xs font-bold text-gray-400 line-through decoration-gray-400 decoration-1">
                                                         ${product.price.toFixed(2)}
                                                   </span>
                                                   <span className={`font-display text-lg tracking-wide leading-none
                                                      ${viewMode === 'retro' ? 'text-brand-red drop-shadow-[1px_1px_0px_#231F20]' : 'text-brand-red'}
                                                   `}>
                                                       ${product.salePrice.toFixed(2)}
                                                   </span>
                                               </div>
                                            ) : (
                                               <div className="flex items-baseline gap-2">
                                                 <span className={`font-display text-lg tracking-wide leading-none
                                                  ${viewMode === 'retro' ? 'text-brand-orange drop-shadow-[1px_1px_0px_#231F20]' : 'text-black'}
                                                   ${isSoldOut ? 'opacity-40 line-through decoration-2 decoration-brand-red' : ''}
                                                 `}>
                                                   ${product.price.toFixed(2)}
                                                 </span>
                                               </div>
                                            )}
                                        </div>
                                        <button 
                                          disabled={isSoldOut}
                                          onClick={(e) => handleQuickAdd(e, product)}
                                          className={`flex items-center justify-center rounded-full transition-all z-20 font-bold text-[10px] uppercase tracking-wider
                                          ${isSoldOut 
                                            ? (viewMode === 'retro' 
                                                ? 'px-3 py-1.5 bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed' 
                                                : 'px-3 py-1.5 bg-gray-50 text-gray-300 cursor-not-allowed')
                                            : (viewMode === 'retro' 
                                                ? 'px-4 py-2 bg-brand-cream border-2 border-brand-black text-brand-black hover:bg-brand-orange hover:text-brand-black hover:border-brand-black shadow-[2px_2px_0px_#231F20] hover:shadow-[3px_3px_0px_#231F20] hover:-translate-y-0.5 active:scale-95' 
                                                : 'px-4 py-2 bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-sm')
                                          }
                                        `}>
                                          {isSoldOut ? (
                                             <span className="flex items-center gap-1">Notify</span>
                                          ) : (
                                             <span className="flex items-center gap-1.5">Add <Plus size={14} strokeWidth={3} /></span>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. List Style Items (Equipment, Merch, Apparel) */}
                {listItems.length > 0 && (
                    <div>
                        {gridItems.length > 0 && <h3 className="font-display text-xl mb-4 border-b border-gray-200 pb-2 mt-8">Equipment & Merch</h3>}
                        <div className="space-y-4 min-h-[100px]">
                            {listItems.map((product) => {
                                const isSoldOut = product.inStock === false;
                                return (
                                    <div 
                                      key={product.id} 
                                      className={`group cursor-pointer relative flex flex-col sm:flex-row gap-6 p-4 sm:p-6 transition-all duration-300
                                        ${viewMode === 'retro' 
                                          ? 'bg-white border-2 border-brand-black shadow-retro hover:shadow-retro-hover' 
                                          : 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md'}
                                      `}
                                      onClick={() => onProductClick(product)}
                                    >
                                      {/* Image - Smaller, horizontal */}
                                      <div className={`w-full sm:w-32 h-32 flex-shrink-0 relative overflow-hidden
                                        ${viewMode === 'retro' ? 'border-2 border-brand-black bg-black' : 'rounded-lg shadow-sm border border-gray-100'}
                                        ${isSoldOut ? 'opacity-80' : ''}
                                      `}>
                                        {isSoldOut && (
                                          <div className={`absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[1px]
                                            ${viewMode === 'retro' ? 'bg-brand-cream/70' : 'bg-black/50'}
                                          `}>
                                            <div className={`px-3 py-2 border-2 text-xs font-bold uppercase tracking-wider transform -rotate-12 shadow-xl
                                              ${viewMode === 'retro' 
                                                ? 'bg-brand-red text-white border-brand-black shadow-[4px_4px_0px_#231F20]' 
                                                : 'bg-white text-black border-transparent rounded-sm'}
                                            `}>
                                              Sold Out
                                            </div>
                                          </div>
                                        )}
                                        <img 
                                          src={product.coverUrl || getDefaultProductImage()} 
                                          alt={product.title} 
                                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110
                                            ${viewMode === 'retro' ? 'grayscale-[10%] group-hover:grayscale-0' : ''}
                                            ${isSoldOut ? 'grayscale contrast-125' : ''}
                                          `}
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = getDefaultProductImage();
                                          }}
                                        />
                                      </div>

                                      {/* Product Info - Horizontal Layout */}
                                      <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div className={`mb-3 ${isSoldOut ? 'opacity-50' : ''}`}>
                                          <h3 className={`font-bold text-lg leading-snug mb-1 transition-colors text-gray-500 group-hover:text-brand-orange group-focus:text-brand-orange
                                            ${viewMode === 'retro' ? 'font-header' : 'font-sans'}
                                          `}>
                                            {product.title}
                                          </h3>
                                          <p className="text-gray-500 group-hover:text-white group-focus:text-white text-sm font-bold uppercase tracking-wider mb-2 transition-colors">{product.artist}</p>
                                          {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                              {product.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest
                                                  ${viewMode === 'retro' 
                                                    ? 'bg-brand-cream text-brand-black border border-brand-black' 
                                                    : 'bg-gray-100 text-gray-700 border border-gray-200 rounded-full'}
                                                `}>
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Footer Price & Add */}
                                        <div className={`pt-3 border-t flex justify-between items-center gap-4
                                          ${viewMode === 'retro' ? 'border-brand-black/10' : 'border-gray-100'}
                                        `}>
                                          <div className="flex flex-col">
                                            {isSoldOut && <span className="text-[10px] font-bold uppercase text-brand-red tracking-wide leading-none mb-0.5">Sold Out</span>}
                                            
                                            {product.salePrice && !isSoldOut ? (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-gray-400 line-through decoration-gray-400 decoration-1">
                                                  ${product.price.toFixed(2)}
                                                </span>
                                                <span className={`font-display text-xl tracking-wide leading-none
                                                  ${viewMode === 'retro' ? 'text-brand-red drop-shadow-[1px_1px_0px_#231F20]' : 'text-brand-red'}
                                                `}>
                                                  ${product.salePrice.toFixed(2)}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-baseline gap-2">
                                                <span className={`font-display text-xl tracking-wide leading-none
                                                  ${viewMode === 'retro' ? 'text-brand-orange drop-shadow-[1px_1px_0px_#231F20]' : 'text-black'}
                                                  ${isSoldOut ? 'opacity-40 line-through decoration-2 decoration-brand-red' : ''}
                                                `}>
                                                  ${product.price.toFixed(2)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <button 
                                            disabled={isSoldOut}
                                            onClick={(e) => handleQuickAdd(e, product)}
                                            className={`flex items-center justify-center rounded-full transition-all z-20 font-bold text-xs uppercase tracking-wider whitespace-nowrap
                                            ${isSoldOut 
                                              ? (viewMode === 'retro' 
                                                  ? 'px-4 py-2 bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed' 
                                                  : 'px-4 py-2 bg-gray-50 text-gray-300 cursor-not-allowed')
                                              : (viewMode === 'retro' 
                                                  ? 'px-5 py-2.5 bg-brand-cream border-2 border-brand-black text-brand-black hover:bg-brand-orange hover:text-brand-black hover:border-brand-black shadow-[2px_2px_0px_#231F20] hover:shadow-[3px_3px_0px_#231F20] hover:-translate-y-0.5 active:scale-95' 
                                                  : 'px-5 py-2.5 bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-sm')
                                            }
                                            `}
                                          >
                                            {isSoldOut ? (
                                              <span className="flex items-center gap-1.5">Notify</span>
                                            ) : (
                                              <span className="flex items-center gap-1.5">Add <Plus size={14} strokeWidth={3} /></span>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
      })()}
      
      {/* Pagination Controls - Hide in compact mode */}
      {!compact && !limit && totalPages > 1 && (
         <div className="mt-16 flex items-center justify-center gap-2">
            <button
               disabled={currentPage === 1}
               onClick={() => handlePageChange(currentPage - 1)}
               className={`p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed
                  ${viewMode === 'retro' 
                    ? 'bg-brand-cream border-2 border-brand-black text-brand-black hover:bg-brand-orange hover:shadow-pop-sm' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'}
               `}
            >
               <ChevronLeft size={16} strokeWidth={3} />
            </button>
            {/* ... Pagination numbers ... */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
               <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded-full transition-all
                     ${currentPage === page 
                        ? (viewMode === 'retro' ? 'bg-brand-black text-white border-2 border-brand-black shadow-pop-sm' : 'bg-black text-white')
                        : (viewMode === 'retro' ? 'bg-brand-cream text-brand-black border-2 border-brand-black hover:bg-brand-mustard' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100')}
                  `}
               >
                  {page}
               </button>
            ))}
            <button
               disabled={currentPage === totalPages}
               onClick={() => handlePageChange(currentPage + 1)}
               className={`p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed
                  ${viewMode === 'retro' 
                    ? 'bg-brand-cream border-2 border-brand-black text-brand-black hover:bg-brand-orange hover:shadow-pop-sm' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'}
               `}
            >
               <ChevronRight size={16} strokeWidth={3} />
            </button>
         </div>
      )}

      {/* View More Button for Limited Views */}
      {limit && onViewMore && (
        <div className="mt-12 flex justify-center">
            <Button 
                variant={viewMode === 'retro' ? 'primary' : 'outline'} 
                size="lg" 
                onClick={onViewMore}
                className={viewMode === 'retro' ? 'shadow-[4px_4px_0px_#231F20] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#231F20] transition-all' : ''}
            >
                View More
            </Button>
        </div>
      )}
    </Wrapper>
  );
};
