"use client";

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import type { FormattedProduct } from '@/lib/types/square';
import { ProductCategory, getAllCategories, CategoryGroups } from '@/lib/types/categories';
import { Loader2, Search, X, Filter, ArrowUpDown } from 'lucide-react';

interface ProductGridProps {
  initialProducts?: FormattedProduct[];
  defaultCategoryGroup?: string; // Optional: pre-select a category group
}

export default function ProductGrid({ initialProducts = [], defaultCategoryGroup }: ProductGridProps) {
  const [products, setProducts] = useState<FormattedProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc'); // Default: Name A-Z
  const [showFilters, setShowFilters] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Fetch products
  const fetchProducts = async (search?: string, nextCursor?: string, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (nextCursor) params.set('cursor', nextCursor);
      // If filtering by category, pass it to the API for server-side filtering
      if (selectedCategory !== 'all') {
        params.set('categoryId', selectedCategory);
      }
      // Increase limit to fetch more products at once
      params.set('limit', '100'); // Fetch 100 at a time

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      let fetchedProducts = data.data.products || [];

      // If we're on a category group page, filter products to only show those from the group
      if (defaultCategoryGroup) {
        const { CategoryGroups } = await import('@/lib/types/categories');
        const groupKey = defaultCategoryGroup.toUpperCase() as keyof typeof CategoryGroups;
        const groupCategories = CategoryGroups[groupKey] || [];
        const categoryNames = groupCategories.map(cat => cat.toString());
        fetchedProducts = fetchedProducts.filter((p: FormattedProduct) => 
          p.category && categoryNames.includes(p.category)
        );
      }

      if (append) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      setCursor(data.data.cursor);
      setHasMore(data.meta?.hasMore || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok && data.success) {
          // Get unique category names from the response
          const categoryNames = Array.from(
            new Set(Object.values(data.data.categoryMap || {}))
          ).sort() as string[];
          setAllCategories(categoryNames);
        } else {
          // Fallback: use enum categories if API fails
          console.warn('Categories API failed, using enum fallback');
          setAllCategories(getAllCategories());
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback: use enum categories if API fails
        setAllCategories(getAllCategories());
      }
    };

    fetchCategories();
  }, []);

  // Initial load or when search/category changes - fetch from server with filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(searchQuery);
      setCursor(undefined);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  // Load more products
  const loadMore = () => {
    if (cursor && !loading) {
      fetchProducts(searchQuery, cursor, true);
    }
  };

  // Get unique categories from products (for highlighting which categories have products)
  const productsWithCategories = products.filter(p => p.category);
  const productCategories = Array.from(
    new Set(productsWithCategories.map(p => p.category).filter(Boolean))
  ) as string[];

  // Use all categories from API, or fallback to product categories if API hasn't loaded yet
  let availableCategories = allCategories.length > 0 ? allCategories : productCategories;

  // If we have a defaultCategoryGroup, filter to only show categories from that group
  if (defaultCategoryGroup) {
    const groupKey = defaultCategoryGroup.toUpperCase() as keyof typeof CategoryGroups;
    const groupCategories = CategoryGroups[groupKey] || [];
    availableCategories = availableCategories.filter(cat => 
      groupCategories.includes(cat as any)
    );
  }

  // Get category groups for organization
  const categoryGroups = Object.keys(CategoryGroups);

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        // Price: Low to High
        const priceA = a.price ?? Infinity;
        const priceB = b.price ?? Infinity;
        return priceA - priceB;
      
      case 'price-desc':
        // Price: High to Low
        const priceA2 = a.price ?? -Infinity;
        const priceB2 = b.price ?? -Infinity;
        return priceB2 - priceA2;
      
      case 'name-asc':
        // Name: A-Z
        return (a.album || a.name).localeCompare(b.album || b.name);
      
      case 'name-desc':
        // Name: Z-A
        return (b.album || b.name).localeCompare(a.album || a.name);
      
      case 'artist-asc':
        // Artist: A-Z
        const artistA = a.artist || '';
        const artistB = b.artist || '';
        if (!artistA && !artistB) return 0;
        if (!artistA) return 1;
        if (!artistB) return -1;
        return artistA.localeCompare(artistB);
      
      case 'artist-desc':
        // Artist: Z-A
        const artistA2 = a.artist || '';
        const artistB2 = b.artist || '';
        if (!artistA2 && !artistB2) return 0;
        if (!artistA2) return 1;
        if (!artistB2) return -1;
        return artistB2.localeCompare(artistA2);
      
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Category Filter and Sort */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* If we have a defaultCategoryGroup, show top-level category buttons */}
          {defaultCategoryGroup ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {availableCategories.map((category) => {
                  const matchingProducts = productsWithCategories.filter(p => 
                    p.category && p.category.trim().toLowerCase() === category.trim().toLowerCase()
                  );
                  const isSelected = selectedCategory.trim().toLowerCase() === category.trim().toLowerCase();
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {category}
                      {matchingProducts.length > 0 && (
                        <span className="ml-2 text-xs opacity-60">
                          ({matchingProducts.length})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            // Original filter dropdown for main catalog page
            (allCategories.length > 0 || productCategories.length > 0) && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  <Filter size={18} />
                  <span className="text-sm">Filter by Category</span>
                </button>
                
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </>
            )
          )}
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 focus:outline-none focus:border-cyan-400/50 transition-colors cursor-pointer"
            >
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="artist-asc">Artist: A-Z</option>
              <option value="artist-desc">Artist: Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
          </div>
        </div>
        
        {/* Show message if no categories are available (only on main catalog, not category group pages) */}
        {!defaultCategoryGroup && allCategories.length === 0 && productCategories.length === 0 && products.length > 0 && (
          <div className="text-white/40 text-sm italic">
            No categories assigned to products. Assign categories in Square to enable filtering.
          </div>
        )}

        {/* Category Dropdown - only show on main catalog page, not category group pages */}
        {!defaultCategoryGroup && showFilters && (allCategories.length > 0 || productCategories.length > 0) && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowFilters(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                All Categories
              </button>
              
              {availableCategories.length > 0 ? (
                categoryGroups.map((groupName) => {
                  const groupCategories = CategoryGroups[groupName as keyof typeof CategoryGroups];
                  const availableInGroup = groupCategories.filter(cat => 
                    availableCategories.includes(cat)
                  );
                  
                  // If we have a defaultCategoryGroup, only show that group
                  if (defaultCategoryGroup && groupName.toLowerCase() !== defaultCategoryGroup.toLowerCase()) {
                    return null;
                  }
                  
                  if (availableInGroup.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-white/50 text-xs uppercase tracking-wider px-3">
                        {groupName}
                      </h4>
                      {availableInGroup.map((category) => {
                        // Use case-insensitive matching for product count and selection
                        const matchingProducts = productsWithCategories.filter(p => 
                          p.category && p.category.trim().toLowerCase() === category.trim().toLowerCase()
                        );
                        const hasProducts = matchingProducts.length > 0;
                        const isSelected = selectedCategory.trim().toLowerCase() === category.trim().toLowerCase();
                        
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-between ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-white/70 hover:bg-white/5'
                            }`}
                          >
                            <span>{category}</span>
                            {hasProducts && (
                              <span className="text-xs text-white/40">
                                ({matchingProducts.length})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-white/60 text-sm px-3 py-2">
                  {loading ? 'Loading categories...' : 'No categories available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      )}

      {/* Products Grid */}
      {(() => {
        // Filter products by selected category (client-side filtering for category group pages)
        let filteredProducts = sortedProducts;
        if (selectedCategory !== 'all') {
          filteredProducts = sortedProducts.filter(p => {
            if (!p.category) return false;
            const productCategory = p.category.trim().toLowerCase();
            const selected = selectedCategory.trim().toLowerCase();
            return productCategory === selected;
          });
        }

        if (filteredProducts.length === 0 && !loading && selectedCategory !== 'all') {
          return (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">
                No products found in "{selectedCategory}" category
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                Show All Products
              </button>
            </div>
          );
        }

        return (
          <>
            {selectedCategory !== 'all' && (
              <div className="mb-4 text-sm text-white/60">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in "{selectedCategory}"
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button - show even when filtering to load more products */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        );
      })()}

      {/* Empty State */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-white/60 text-lg">
            {searchQuery ? 'No products found' : 'No products available'}
          </p>
        </div>
      )}
    </div>
  );
}

