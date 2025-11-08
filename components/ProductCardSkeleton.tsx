/**
 * Loading skeleton for ProductCard
 * Provides smooth loading experience while products are being fetched
 */

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white p-4 animate-pulse">
      {/* Album Cover with Vinyl Record Overlap */}
      <div className="relative mb-12 flex justify-center">
        {/* Vinyl Record Background Skeleton */}
        <div className="absolute top-2 left-8 w-32 h-32 bg-neutral-200 rounded-full"></div>
        
        {/* Album Cover Skeleton */}
        <div className="relative z-10 w-28 h-28 bg-neutral-200 rounded shadow-xl transform -rotate-6"></div>
      </div>
      
      {/* Product Details Skeleton */}
      <div className="text-center mb-4 space-y-2">
        <div className="h-4 bg-neutral-200 rounded mx-auto w-3/4"></div>
        <div className="h-3 bg-neutral-200 rounded mx-auto w-1/2"></div>
        <div className="h-3 bg-neutral-200 rounded mx-auto w-2/3"></div>
        <div className="h-4 bg-neutral-200 rounded mx-auto w-1/3"></div>
      </div>
      
      {/* Add to Cart Button Skeleton */}
      <div className="flex justify-center">
        <div className="w-8 h-8 border border-neutral-300 rounded bg-neutral-100"></div>
      </div>
    </div>
  );
}

