'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { PRODUCT_FILTERS } from '@/lib/constants';

interface Product {
  id: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  image: string;
  in_stock: boolean;
  condition: string;
  genre: string;
  decade: string;
  format: string;
}

interface ShopPageProps {
  initialProducts?: Product[];
}

export default function ShopPage({ initialProducts = [] }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    genre: '',
    condition: '',
    decade: '',
    format: '',
    minPrice: '',
    maxPrice: '',
    sort: 'relevance'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '24',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`/api/catalog?${params}`);
      const data = await response.json();
      
      setProducts(data.items || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPrevPage: data.pagination?.hasPrevPage || false
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-black mb-4">
            Shop Vinyl Records
          </h1>
          <p className="text-lg text-neutral-gray">
            Discover our curated collection of new and used vinyl records
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-primary-cream border border-accent-teal/20 rounded-large p-6 sticky top-24">
              <h3 className="font-display font-semibold text-lg text-primary-black mb-6">
                Filters
              </h3>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <Input
                    label="Search"
                    placeholder="Artist, album, or keyword"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-primary-black mb-2">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    <option value="">All Genres</option>
                    {PRODUCT_FILTERS.genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-primary-black mb-2">
                    Condition
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    <option value="">All Conditions</option>
                    {PRODUCT_FILTERS.conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Decade */}
                <div>
                  <label className="block text-sm font-medium text-primary-black mb-2">
                    Decade
                  </label>
                  <select
                    value={filters.decade}
                    onChange={(e) => handleFilterChange('decade', e.target.value)}
                    className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    <option value="">All Decades</option>
                    {PRODUCT_FILTERS.decades.map(decade => (
                      <option key={decade} value={decade}>{decade}</option>
                    ))}
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-primary-black mb-2">
                    Format
                  </label>
                  <select
                    value={filters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    <option value="">All Formats</option>
                    {PRODUCT_FILTERS.formats.map(format => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-primary-black mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="title_asc">Title: A to Z</option>
                    <option value="title_desc">Title: Z to A</option>
                    <option value="artist_asc">Artist: A to Z</option>
                    <option value="artist_desc">Artist: Z to A</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      query: '',
                      genre: '',
                      condition: '',
                      decade: '',
                      format: '',
                      minPrice: '',
                      maxPrice: '',
                      sort: 'relevance'
                    });
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-neutral-gray/20 rounded-t-large" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-neutral-gray/20 rounded mb-2" />
                      <div className="h-3 bg-neutral-gray/20 rounded mb-2" />
                      <div className="h-4 bg-neutral-gray/20 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      variant="product"
                      className="group cursor-pointer"
                    >
                      <Link href={`/shop/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden rounded-t-large">
                          <Image
                            src={product.image}
                            alt={`${product.artist} - ${product.title}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          
                          {/* Stock indicator */}
                          {product.in_stock && (
                            <div className="absolute top-2 right-2 bg-accent-teal text-primary-cream text-xs px-2 py-1 rounded-full font-semibold">
                              In Stock
                            </div>
                          )}

                          {/* Condition badge */}
                          <div className="absolute top-2 left-2 bg-primary-black/80 text-primary-cream text-xs px-2 py-1 rounded-full">
                            {product.condition}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-display font-semibold text-lg text-primary-black mb-1 line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-neutral-gray text-sm mb-2 line-clamp-1">
                            {product.artist}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-accent-teal font-semibold text-lg">
                              {formatCurrency(product.price / 100, product.currency)}
                            </span>
                            <span className="text-xs text-neutral-gray bg-neutral-gray/10 px-2 py-1 rounded">
                              {product.genre}
                            </span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-8 h-8 rounded-small text-sm font-medium transition-colors ${
                            pagination.page === i + 1
                              ? 'bg-accent-teal text-primary-cream'
                              : 'text-primary-black hover:bg-accent-teal/10'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-display font-semibold text-primary-black mb-2">
                  No products found
                </h3>
                <p className="text-neutral-gray mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={() => {
                    setFilters({
                      query: '',
                      genre: '',
                      condition: '',
                      decade: '',
                      format: '',
                      minPrice: '',
                      maxPrice: '',
                      sort: 'relevance'
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
