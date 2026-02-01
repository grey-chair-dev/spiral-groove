
import React from 'react';
import { ViewMode, Product, Page } from '../../types';
import { ProductGrid } from './ProductGrid';

interface CatalogPageProps {
    viewMode: ViewMode;
    products: Product[];
    onProductClick: (product: Product) => void;
    onQuickAdd: (product: Product) => void;
    initialFilter?: string;
    initialArtist?: string;
    onHomeClick: () => void;
    onNavigate: (page: Page, filter?: string, artist?: string) => void;
    onFilterChange?: (filter: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
    viewMode, 
    products, 
    onProductClick, 
    onQuickAdd,
    initialFilter,
    initialArtist,
    onHomeClick,
    onNavigate,
    onFilterChange
}) => {
    return (
        <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center flex-wrap">
                    <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={() => onNavigate('home')}>Home</span> 
                    <span className="mx-2 opacity-50">/</span> 
                        <span 
                            className={`cursor-pointer transition-colors ${!initialFilter || initialFilter === 'All' ? 'text-brand-black' : 'hover:text-brand-orange'}`} 
                            onClick={() => onFilterChange && onFilterChange('All')}
                        >
                            Catalog
                        </span>

                    {initialFilter && initialFilter !== 'All' && (
                        <>
                            <span className="mx-2 opacity-50">/</span>
                            <span className="text-brand-black">{initialFilter}</span>
                        </>
                    )}
                </div>
             </div>
            <ProductGrid 
                products={products} 
                onProductClick={onProductClick} 
                onQuickAdd={onQuickAdd} 
                viewMode={viewMode}
                initialFilter={initialFilter}
                initialArtist={initialArtist}
                onFilterChange={onFilterChange}
                defaultSort="artist-asc"
            />
        </div>
    )
}
