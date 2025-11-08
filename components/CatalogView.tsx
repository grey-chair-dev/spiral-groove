"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Grid, List, Loader2 } from 'lucide-react';
import ProductSchema from './ProductSchema';

interface SquareProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
  quantity?: number;
}

interface CatalogViewProps {
  showSearch?: boolean;
  showFilters?: boolean;
  maxProducts?: number;
  className?: string;
}

export default function CatalogView({ 
  showSearch = true, 
  showFilters = true, 
  maxProducts,
  className = '' 
}: CatalogViewProps) {
  const [products, setProducts] = useState<SquareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/square/products');
      const data = await response.json();
      
      if (response.ok) {
        let fetchedProducts = data.products || [];
        
        // Limit products if maxProducts is specified
        if (maxProducts && fetchedProducts.length > maxProducts) {
          fetchedProducts = fetchedProducts.slice(0, maxProducts);
        }
        
        setProducts(fetchedProducts);
        
        // If no products and there's a message about Square not being configured
        if (fetchedProducts.length === 0 && data.message) {
          setError(data.message);
        }
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100); // Square prices are in cents
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-teal mx-auto mb-4" />
          <p className="text-neutral-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Catalog</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Sort and View Mode */}
            {showFilters && (
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'newest')}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-accent-teal text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-accent-teal text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white rounded-lg border border-neutral-200 p-12">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Products Found</h3>
            <p className="text-neutral-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No products available in catalog'}
            </p>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Product Schema */}
              <ProductSchema
                title={product.name}
                imageUrl={product.imageUrl}
                price={product.price}
                productId={product.id}
                inStock={product.inStock}
              />
              {/* Product Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'} overflow-hidden`}>
                {product.imageUrl ? (
                  <>
                    <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                    <Image
                      src={product.imageUrl}
                      alt={`${product.name} at Spiral Groove Records`}
                      fill
                      className="object-cover transition-opacity duration-300"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-neutral-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-text-dark mb-1 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-accent-teal">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-neutral-500">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredProducts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-neutral-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      )}
    </div>
  );
}
