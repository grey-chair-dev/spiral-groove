'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

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
}

interface FeaturedProductsProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

export default function FeaturedProducts({
  products = [],
  title = 'Featured New Arrivals',
  subtitle = 'Discover the latest additions to our collection',
  showViewAll = true,
  maxItems = 8
}: FeaturedProductsProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products from API
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/new-arrivals?limit=8');
        const data = await response.json();
        setFeaturedProducts(data.items || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        // Fallback to mock data
        setFeaturedProducts(products.slice(0, maxItems));
      } finally {
        setLoading(false);
      }
    };

    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, maxItems));
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [products, maxItems]);

  if (loading) {
    return (
      <section className="py-16 bg-primary-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
              {title}
            </h2>
            <p className="text-lg text-neutral-gray">
              {subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-neutral-gray/20 rounded-large" />
                <CardContent className="p-4">
                  <div className="h-4 bg-neutral-gray/20 rounded mb-2" />
                  <div className="h-3 bg-neutral-gray/20 rounded mb-2" />
                  <div className="h-4 bg-neutral-gray/20 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-primary-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <Card
              key={product.id}
              variant="product"
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/shop/${product.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-t-large">
                  <Image
                    src={product.image}
                    alt={`${product.artist} - ${product.title}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Overlay with quick actions */}
                  <div className="absolute inset-0 bg-primary-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-accent-teal hover:bg-accent-amber">
                        Quick View
                      </Button>
                      <Button size="sm" variant="outline" className="border-primary-cream text-primary-cream hover:bg-primary-cream hover:text-primary-black">
                        Add to Cart
                      </Button>
                    </div>
                  </div>

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

        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
