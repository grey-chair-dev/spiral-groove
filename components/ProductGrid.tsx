"use client";
import useSWR from "swr";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useEffect, useState } from "react";
import { type PlaceholderSection } from "@/lib/utils/placeholders";
import { demoProducts } from "@/lib/data/demo";
import { isFeatureEnabled } from "@/lib/features";

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) {
    // If API fails, return empty array to trigger fallback
    return { products: [] };
  }
  return r.json();
});

interface ProductGridProps {
  limit?: number;
  section?: PlaceholderSection;
}

export default function ProductGrid({ limit, section }: ProductGridProps) {
  const { data, error, isLoading } = useSWR(`/api/products?limit=${limit ?? 20}`, fetcher);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use demo products as fallback if API fails or returns no products (only if feature flag is enabled)
  const products = mounted 
    ? (data?.products && data.products.length > 0 
        ? data.products 
        : (isFeatureEnabled('ENABLE_DEMO_PRODUCTS_FALLBACK') 
            ? demoProducts.slice(0, limit ?? 20)
            : []))
    : [];
  
  if (isLoading || !mounted) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-responsive">
        {Array.from({ length: limit ?? 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p: any) => <ProductCard key={p.id} p={p} section={section} />)}
    </div>
  );
}
