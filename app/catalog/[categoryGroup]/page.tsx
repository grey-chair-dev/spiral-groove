"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogOut, Music, ArrowLeft } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import type { FormattedProduct } from "@/lib/types/square";
import { CategoryGroups } from "@/lib/types/categories";

const CATEGORY_GROUP_NAMES: Record<string, string> = {
  vinyl: 'Vinyl',
  media: 'Media',
  genres: 'Genres',
  collectibles: 'Collectibles',
  accessories: 'Accessories',
  electronics: 'Electronics',
  'home-lifestyle': 'Home & Lifestyle',
  'food-drink': 'Food & Drink',
  'books-media': 'Books & Media',
  events: 'Events',
  uncategorized: 'Uncategorized',
};

export default function CategoryGroupPage() {
  const router = useRouter();
  const params = useParams();
  const categoryGroup = params?.categoryGroup as string;
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
      // Get all categories in this group
      const groupKey = categoryGroup.toUpperCase() as keyof typeof CategoryGroups;
      const categories = CategoryGroups[groupKey] || [];
      
      if (categories.length === 0) {
        setInitialProducts([]);
        return;
      }

      // Fetch all products and filter by category group
      // We fetch a large limit to get all products, then filter client-side
      const response = await fetch('/api/products?limit=500');
      const data = await response.json();
      if (response.ok && data.success) {
        // Filter products that belong to any category in this group
        const categoryNames = categories.map(cat => cat.toString());
        const filtered = (data.data.products || []).filter((p: FormattedProduct) => 
          p.category && categoryNames.includes(p.category)
        );
        setInitialProducts(filtered);
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

  const displayName = CATEGORY_GROUP_NAMES[categoryGroup] || categoryGroup;
  const groupKey = categoryGroup.toUpperCase() as keyof typeof CategoryGroups;
  const categories = CategoryGroups[groupKey] || [];

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
          <h1 className="text-xl sm:text-2xl font-bold">{displayName}</h1>
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">{displayName}</h2>
            <p className="text-white/60">
              Browse our collection of {displayName.toLowerCase()} products
            </p>
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <ProductGrid 
            initialProducts={initialProducts}
            defaultCategoryGroup={categoryGroup}
          />
        </div>
      </main>
    </div>
  );
}

