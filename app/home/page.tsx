"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Music, ShoppingCart } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import type { FormattedProduct } from "@/lib/types/square";
import { useCart } from "@/contexts/CartContext";

// Category Group Card Component
function CategoryGroupCard({ 
  href, 
  title, 
  description, 
  icon 
}: { 
  href: string; 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <p className="text-white/60 text-sm">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [initialProducts, setInitialProducts] = useState<FormattedProduct[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        setAuthenticated(true);
        // Load initial products
        loadInitialProducts();
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      if (response.ok && data.success) {
        setInitialProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Music className="text-cyan-400" size={24} />
          <h1 className="text-xl sm:text-2xl font-bold">Spiral Groove Records</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm sm:text-base"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-cyan-500 text-white rounded-full text-xs font-bold min-w-[1.25rem] text-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm sm:text-base"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

            {/* Main Content */}
            <main className="p-4 sm:p-8 md:p-12 lg:p-16">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">Catalog</h2>
                  <p className="text-white/60">Browse our collection of records</p>
                </div>

                {/* Category Group Navigation */}
                <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <CategoryGroupCard
                    href="/catalog/vinyl"
                    title="Vinyl"
                    description="New & Used Records"
                    icon="🎵"
                  />
                  <CategoryGroupCard
                    href="/catalog/media"
                    title="Media"
                    description="CDs, DVDs, Cassettes"
                    icon="💿"
                  />
                  <CategoryGroupCard
                    href="/catalog/genres"
                    title="Genres"
                    description="All Music Genres"
                    icon="🎸"
                  />
                  <CategoryGroupCard
                    href="/catalog/collectibles"
                    title="Collectibles"
                    description="Action Figures & More"
                    icon="🎭"
                  />
                  <CategoryGroupCard
                    href="/catalog/accessories"
                    title="Accessories"
                    description="Record Care & Gear"
                    icon="🎧"
                  />
                  <CategoryGroupCard
                    href="/catalog/electronics"
                    title="Electronics"
                    description="Equipment & Audio"
                    icon="📻"
                  />
                  <CategoryGroupCard
                    href="/catalog/home-lifestyle"
                    title="Home & Lifestyle"
                    description="Candles, Incense & More"
                    icon="🕯️"
                  />
                  <CategoryGroupCard
                    href="/catalog/food-drink"
                    title="Food & Drink"
                    description="Snacks & Beverages"
                    icon="🍿"
                  />
                  <CategoryGroupCard
                    href="/catalog/books-media"
                    title="Books & Media"
                    description="Books, Puzzles & Games"
                    icon="📚"
                  />
                  <CategoryGroupCard
                    href="/catalog/events"
                    title="Events"
                    description="Record Store Day"
                    icon="🎉"
                  />
                </div>
                
                <ProductGrid initialProducts={initialProducts} />
              </div>
            </main>
    </div>
  );
}

