import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  const getConditionBadge = (condition: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (condition === 'new') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-200"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={getConditionBadge(product.condition)}>
            {product.condition}
          </span>
          <span className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {product.artist && (
          <p className="text-sm text-gray-600 mb-2">
            {product.artist}
          </p>
        )}
        
        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          
          <div className="flex space-x-2">
            <Link
              href={`/products/${product.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View Details
            </Link>
            <button
              disabled={product.stock === 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

