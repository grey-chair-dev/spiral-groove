"use client";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getProductImage, getPlaceholderStyles, getPlaceholderAltText, type PlaceholderSection } from "@/lib/utils/placeholders";
import { trackAddToCart } from "@/lib/analytics";
import ProductSchema from "./ProductSchema";

interface ProductCardProps {
  p: any;
  section?: PlaceholderSection;
}

export default function ProductCard({ p, section }: ProductCardProps) {
  const add = useStore((s) => s.addToCart);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get product image with consistent placeholder handling
  const category = p.category || p.genre?.toLowerCase() || 'vinyl';
  const productImage = getProductImage(p.cover, category, section);
  const placeholderStyles = getPlaceholderStyles(section);

  const handleAddToCart = () => {
    if (mounted && p.inStock) {
      add({ id: p.id, title: p.title, price: p.price, cover: p.cover });
      trackAddToCart(p.title);
    }
  };

  return (
    <div className="bg-white p-4 group">
      {/* Product Schema */}
      <ProductSchema
        title={p.title}
        artist={p.artist}
        imageUrl={p.cover}
        price={p.price}
        productId={p.id}
        slug={p.slug || p.id}
        inStock={p.inStock}
      />
      {/* Album Cover with Vinyl Record Overlap */}
      <div className="relative mb-12 flex justify-center">
        {/* Vinyl Record Background */}
        <div className="absolute top-2 left-8 w-32 h-32 bg-black rounded-full shadow-lg transform rotate-12">
          <div className="absolute inset-2 bg-neutral-800 rounded-full"></div>
          <div className="absolute inset-4 bg-neutral-900 rounded-full"></div>
          <div className="absolute inset-6 bg-black rounded-full"></div>
          <div className="absolute inset-8 bg-neutral-900 rounded-full"></div>
          <div className="absolute inset-10 bg-black rounded-full"></div>
          <div className="absolute inset-12 bg-neutral-900 rounded-full"></div>
          <div className="absolute inset-14 bg-black rounded-full"></div>
          <div className="absolute inset-16 bg-neutral-900 rounded-full"></div>
        </div>
        
        {/* Album Cover */}
        <div className="relative z-10 w-28 h-28 shadow-xl transform -rotate-6">
          {imageLoading && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded" />
          )}
          <Image 
            src={productImage.src}
            alt={productImage.isPlaceholder 
              ? getPlaceholderAltText(category, p.title)
              : `${p.title}${p.artist ? ` by ${p.artist}` : ''} at Spiral Groove Records`}
            width={112}
            height={112}
            className={`object-cover w-full h-full transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } ${productImage.isPlaceholder ? placeholderStyles : ''}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            loading="lazy"
          />
          {imageError && (
            <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-400 text-xs">No Image</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-sm text-black mb-1 leading-tight">
          {p.title}
        </h3>
        {p.condition && (
          <p className="text-xs text-neutral-500 mb-1">({p.condition})</p>
        )}
        <p className="text-xs text-neutral-500 mb-2">{p.artist}</p>
        <p className="font-bold text-sm text-black">${p.price.toFixed(2)}</p>
      </div>
      
      {/* Add to Cart Button */}
      <div className="flex justify-center">
        <button 
          className="w-8 h-8 border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-100 transition-colors text-black bg-white"
          onClick={handleAddToCart}
          disabled={!mounted || !p.inStock}
          aria-label={`Add ${p.title}${p.artist ? ` by ${p.artist}` : ''} to cart`}
        >
          <Plus size={14} className="text-black" />
        </button>
      </div>
    </div>
  );
}
