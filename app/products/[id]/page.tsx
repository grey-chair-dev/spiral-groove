"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Music, ArrowLeft, ShoppingCart, Check, Loader2 } from "lucide-react";
import type { FormattedProduct } from "@/lib/types/square";
import { useCart } from "@/contexts/CartContext";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [product, setProduct] = useState<FormattedProduct | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    checkAuth();
  }, [productId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        setAuthenticated(true);
        loadProduct();
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || 'Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
      console.error('Error loading product:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product || !product.variations || product.variations.length === 0) {
      setError('Product is not available for purchase');
      return;
    }

    if (product.stock !== null && product.stock === 0) {
      setError('Product is out of stock');
      return;
    }

    // Get the first variation
    const variation = product.variations[0];
    const variationId = variation.id;
    
    addToCart(product, variationId, 1);
    setAdded(true);
    setError(null);
    
    // Reset the "Added" state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/20 px-4 sm:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Back to catalog"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>
        <main className="p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Back to Catalog
          </button>
        </main>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const firstVariation = product.variations?.[0];
  const price = product.price || (firstVariation?.itemVariationData?.priceMoney?.amount 
    ? Number(firstVariation.itemVariationData.priceMoney.amount) / 100 
    : null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Back to catalog"
          >
            <ArrowLeft size={20} />
          </button>
          <Music className="text-cyan-400" size={24} />
          <h1 className="text-xl sm:text-2xl font-bold">Product Details</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm sm:text-base"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={96} className="text-white/20" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {product.category && (
                <div className="text-sm text-white/60 uppercase tracking-wider">
                  {product.category}
                </div>
              )}

              {product.artist ? (
                <>
                  <div>
                    <p className="text-white/70 text-lg mb-2">{product.artist}</p>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.album}</h1>
                  </div>
                </>
              ) : (
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.album}</h1>
              )}

              {price !== null && (
                <div className="text-4xl font-bold text-cyan-400">
                  ${price.toFixed(2)}
                </div>
              )}

              {product.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Variations */}
              {product.variations && product.variations.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Variations</h3>
                  <div className="space-y-2">
                    {product.variations.map((variation) => {
                      const variationPrice = variation.itemVariationData?.priceMoney?.amount
                        ? Number(variation.itemVariationData.priceMoney.amount) / 100
                        : null;
                      return (
                        <div
                          key={variation.id}
                          className="p-3 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">
                              {variation.itemVariationData?.name || 'Default'}
                            </span>
                            {variationPrice !== null && (
                              <span className="text-cyan-400 font-semibold">
                                ${variationPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              {/* Add to Cart Button */}
              {product.stock !== null && product.stock === 0 ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/20 border-2 border-red-400/50 text-red-400 rounded-lg opacity-50 cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={added || price === null || !product.variations || product.variations.length === 0 || (product.stock !== null && product.stock === 0)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                >
                  {added ? (
                    <>
                      <Check size={20} />
                      Added to Cart!
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              )}

              {(!product.variations || product.variations.length === 0) && (
                <p className="text-white/60 text-sm text-center">
                  This product is currently unavailable for purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

