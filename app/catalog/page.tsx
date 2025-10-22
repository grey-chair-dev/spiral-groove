"use client";

import CatalogView from '@/components/CatalogView';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl mb-2">Product Catalog</h1>
          <p className="text-neutral-600">
            Browse our complete inventory from Square
          </p>
        </div>

        {/* Catalog View */}
        <CatalogView 
          showSearch={true}
          showFilters={true}
        />
      </div>
    </div>
  );
}
