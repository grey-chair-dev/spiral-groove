"use client";

import CatalogView from '@/components/CatalogView';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-2 text-text-dark">Product Catalog</h1>
          <p className="text-lg text-neutral-600">
            Browse our complete inventory of vinyl records and audio equipment
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
