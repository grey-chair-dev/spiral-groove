"use client";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Eye, Heart } from "lucide-react";

export default function ProductCard({ p }: { p: any }) {
  const add = useStore((s) => s.addToCart);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate placeholder image based on genre or use default
  const getImageUrl = () => {
    if (p.cover && p.cover !== '/covers/demo-1.jpg') return p.cover;
    
    const genre = p.genre?.toLowerCase() || 'vinyl';
    const imageMap: { [key: string]: string } = {
      'jazz': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'rock': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'classical': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'blues': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'soul': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'funk': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    };
    
    return imageMap[genre] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  return (
    <div className="bg-white p-4 group">
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
          <Image 
            src={getImageUrl()}
            alt={`${p.title} by ${p.artist}`}
            width={112}
            height={112}
            className="object-cover w-full h-full"
          />
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
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <button 
          className="w-8 h-8 border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-100 transition-colors text-black bg-white"
          onClick={() => mounted && add({ id: p.id, title: p.title, price: p.price, cover: p.cover })}
          disabled={!mounted || !p.inStock}
        >
          <ShoppingCart size={14} className="text-black" />
        </button>
        <button className="w-8 h-8 border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-100 transition-colors">
          <Heart size={14} className="text-black" />
        </button>
      </div>
    </div>
  );
}
