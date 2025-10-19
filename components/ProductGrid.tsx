"use client";
import useSWR from "swr";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProductGrid({ limit }: { limit?: number }) {
  const { data } = useSWR(`/api/products?limit=${limit ?? 20}`, fetcher);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const products = mounted ? (data?.products ?? []) : [];
  
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-responsive">
      {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
