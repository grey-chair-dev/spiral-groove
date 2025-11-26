"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { FormattedProduct } from '@/lib/types/square';
import { Music, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: FormattedProduct;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/products/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    
    if (!product.variations || product.variations.length === 0) {
      return;
    }

    if (product.stock !== null && product.stock === 0) {
      return;
    }

    // Get the first variation
    const variation = product.variations[0];
    const variationId = variation.id;
    
    addToCart(product, variationId, 1);
    setAdded(true);
    
    // Reset the "Added" state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock !== null && product.stock === 0;
  const canPurchase = product.variations && product.variations.length > 0 && !isOutOfStock;

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-black/20 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={48} className="text-white/20" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {product.artist ? (
          <>
            <p className="text-white/70 text-xs mb-1 line-clamp-1">
              {product.artist}
            </p>
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {product.album}
            </h3>
          </>
        ) : (
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {product.album}
          </h3>
        )}
        
        <div className="flex items-center justify-between mt-2">
          {product.price !== null && (
            <p className="text-cyan-400 font-bold text-lg">
              ${product.price.toFixed(2)}
            </p>
          )}
          {product.stock !== null && (
            <p className={`text-xs font-medium ${
              product.stock > 0 
                ? product.stock <= 10
                  ? 'text-yellow-400'
                  : 'text-green-400'
                : 'text-red-400'
            }`}>
              {product.stock === 0 
                ? 'Out of stock'
                : product.stock <= 10
                  ? `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} left`
                  : 'In stock'}
            </p>
          )}
        </div>
        
        {product.description && (
          <p className="text-white/60 text-xs mt-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Add to Cart Button */}
        <div className="mt-3 pt-3 border-t border-white/10">
          {isOutOfStock ? (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 bg-red-500/20 border border-red-400/50 text-red-400 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : canPurchase ? (
            <button
              onClick={handleAddToCart}
              disabled={added}
              className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check size={16} />
                  Added!
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/products/${product.id}`);
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

