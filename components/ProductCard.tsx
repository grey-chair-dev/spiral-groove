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
  // Force category to 'vinyl' for all products to ensure album placeholders are used
  const category = 'vinyl'; // Always use vinyl category to get album placeholders
  const productImage = getProductImage(p.cover, category, section, p.id);
  const placeholderStyles = getPlaceholderStyles(section);
  
  // Use album title and artist from the placeholder if available (for consistency with image)
  const displayTitle = productImage.albumTitle || p.title;
  const displayArtist = productImage.albumArtist || p.artist;

  const handleAddToCart = () => {
    if (mounted && p.inStock) {
      add({ id: p.id, title: p.title, price: p.price, cover: p.cover });
      trackAddToCart(p.title);
    }
  };

  return (
    <div className="bg-white p-4 group border border-neutral-200 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
      {/* Album Cover Image */}
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded">
        {imageLoading && (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
        )}
        <Image 
          src={productImage.src}
          alt={productImage.isPlaceholder 
            ? getPlaceholderAltText(category, p.title)
            : `${p.title}${p.artist ? ` by ${p.artist}` : ''} at Spiral Groove Records`}
          fill
          className={`object-cover transition-opacity duration-300 ${
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
      
      {/* Product Details */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-sm text-black mb-1 leading-tight">
          {displayTitle}
          {p.condition && <span className="text-neutral-500 font-normal"> — ({p.condition})</span>}
        </h3>
        <p className="text-xs text-neutral-500 mb-2">{displayArtist}</p>
        <p className="font-bold text-base text-black mb-2">${p.price.toFixed(2)}</p>
        {/* Staff Notes - Add personality */}
        <p className="text-xs italic text-neutral-500 mt-1">
          {p.staffNote || (section === 'staff-picks' ? "Picked by Steve — plays clean and loud." : section === 'new-arrivals' ? "Just in — grab it while it lasts." : "Fresh from the crates.")}
        </p>
      </div>
      
      {/* Add to Cart Button */}
      <div className="flex justify-center mt-2">
        <button 
          className="px-4 py-2 bg-mustard text-white rounded-full text-sm font-semibold hover:bg-mustard/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={!mounted || !p.inStock}
          aria-label={`Add ${p.title}${p.artist ? ` by ${p.artist}` : ''} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
