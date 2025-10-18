'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { getFeatureFlag } from '@/lib/feature-flags';

interface Product {
  id: string;
  title: string;
  artist: string;
  label: string;
  condition: string;
  price: number;
  currency: string;
  image: string;
  images: string[];
  in_stock: boolean;
  quantity: number;
  genre: string;
  decade: string;
  format: string;
  pressing: string;
  year: number;
  description: string;
  sku: string;
  details: {
    pressing: string;
    media_condition: string;
    sleeve_condition: string;
    format: string;
  };
}

interface ProductPageProps {
  productId: string;
}

export default function ProductPage({ productId }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data.product);
      } else {
        console.error('Failed to fetch product:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // In a real app, this would add to cart or redirect to checkout
    console.log('Adding to cart:', { productId: product.id, quantity });
    
    if (getFeatureFlag('FEATURE_CHECKOUT_ENABLED')) {
      // Redirect to checkout
      window.location.href = `/checkout?items=${product.id}:${quantity}`;
    } else {
      alert('Checkout is coming soon! Please contact us to place an order.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-cream py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-neutral-gray/20 rounded-large animate-pulse" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-neutral-gray/20 rounded-medium animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-neutral-gray/20 rounded animate-pulse" />
              <div className="h-6 bg-neutral-gray/20 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-neutral-gray/20 rounded w-1/3 animate-pulse" />
              <div className="h-12 bg-neutral-gray/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary-cream py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-3xl font-display font-bold text-primary-black mb-4">
            Product Not Found
          </h1>
          <p className="text-neutral-gray mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/shop">
            <Button size="lg">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-cream py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-neutral-gray">
            <li>
              <Link href="/" className="hover:text-accent-teal transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/shop" className="hover:text-accent-teal transition-colors">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li className="text-primary-black">{product.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-primary-cream border border-accent-teal/20 rounded-large overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={`${product.artist} - ${product.title}`}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-primary-cream border-2 rounded-medium overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'border-accent-teal'
                        : 'border-accent-teal/20 hover:border-accent-teal/50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.artist} - ${product.title} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-black mb-2">
                {product.title}
              </h1>
              <p className="text-xl text-neutral-gray mb-4">
                by {product.artist}
              </p>
              <div className="flex items-center space-x-4 text-sm text-neutral-gray">
                <span>{product.label}</span>
                <span>•</span>
                <span>{product.year}</span>
                <span>•</span>
                <span>{product.format}</span>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-accent-teal">
                {formatCurrency(product.price / 100, product.currency)}
              </div>
              <div className="flex items-center space-x-2">
                {product.in_stock ? (
                  <span className="text-green-600 text-sm font-semibold">
                    ✓ In Stock ({product.quantity} available)
                  </span>
                ) : (
                  <span className="text-red-600 text-sm font-semibold">
                    ✗ Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Condition and Details */}
            <Card className="bg-accent-teal/5 border-accent-teal/20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary-black mb-3">Record Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-gray">Condition:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.condition}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">Format:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.format}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">Label:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.label}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">Year:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.year}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">Genre:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.genre}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray">SKU:</span>
                    <span className="ml-2 font-semibold text-primary-black">{product.sku}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-primary-black mb-2">Description</h3>
                <p className="text-neutral-gray leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            {product.in_stock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-primary-black">
                    Quantity:
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                  >
                    {[...Array(Math.min(product.quantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1"
                  >
                    {getFeatureFlag('FEATURE_CHECKOUT_ENABLED') ? 'Add to Cart' : 'Contact to Order'}
                  </Button>
                  
                  {getFeatureFlag('FEATURE_IN_STORE_PICKUP') && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => alert('In-store pickup coming soon!')}
                    >
                      Reserve for Pickup
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Contact for out of stock */}
            {!product.in_stock && (
              <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-large p-4">
                <p className="text-primary-black text-sm">
                  This item is currently out of stock. Contact us to be notified when it's back in stock.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.location.href = 'mailto:info@spiralgrooverecords.com'}
                >
                  Contact Us
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
