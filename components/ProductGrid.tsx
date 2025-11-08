"use client";
import useSWR from "swr";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useEffect, useState } from "react";
import { type PlaceholderSection } from "@/lib/utils/placeholders";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ProductGridProps {
  limit?: number;
  section?: PlaceholderSection;
}

export default function ProductGrid({ limit, section }: ProductGridProps) {
  const { data, isLoading } = useSWR(`/api/products?limit=${limit ?? 20}`, fetcher);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const products = mounted ? (data?.products ?? []) : [];
  
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
    <div className="grid gap-4 sm:gap-6 grid-cols-responsive">
      {products.map((p: any) => <ProductCard key={p.id} p={p} section={section} />)}
    </div>
  );
}
