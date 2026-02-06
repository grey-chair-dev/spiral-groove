import React from 'react';
import { ViewMode, Product, Page } from '../../types';
import { ProductGrid } from './ProductGrid';
import { Search } from 'lucide-react';

interface SearchPageProps {
    viewMode: ViewMode;
    products: Product[];
    searchQuery: string;
    onProductClick: (product: Product) => void;
    onQuickAdd: (product: Product) => void;
    onHomeClick: () => void;
    onNavigate: (page: Page, filter?: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ 
    viewMode, 
    products, 
    searchQuery,
    onProductClick, 
    onQuickAdd,
    onHomeClick,
    onNavigate
}) => {
    const q = (searchQuery || '').trim().toLowerCase()

    // Perform search.
    // NOTE: For 1-character queries, avoid matching format/genre/tags because most items have
    // format like "Vinyl" (contains "y"), which makes the search look broken (everything matches).
    const filteredProducts = products.filter((product) => {
        if (!q) return false

        const inTitle = product.title.toLowerCase().includes(q)
        const inArtist = product.artist.toLowerCase().includes(q)
        if (inTitle || inArtist) return true

        if (q.length < 2) return false

        const inTags = product.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false
        const inGenre = product.genre.toLowerCase().includes(q)
        const inFormat = product.format.toLowerCase().includes(q)
        return inTags || inGenre || inFormat
    })

    const isRetro = viewMode === 'retro';

    return (
        <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                {/* Breadcrumbs */}
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                    <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={onHomeClick}>Home</span> 
                    <span className="mx-2 opacity-50">/</span> 
                    <span className="text-brand-black">Search Results</span>
                </div>

                {/* Search Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-8">
                    <div className="flex items-center gap-3 text-brand-orange">
                        <Search size={32} strokeWidth={2.5} />
                        <h1 className={`text-3xl md:text-4xl leading-none
                            ${isRetro ? 'font-display text-brand-black' : 'font-bold text-gray-900'}
                        `}>
                            Search Results
                        </h1>
                    </div>
                    <p className={`text-lg
                        ${isRetro ? 'text-gray-600 font-bold' : 'text-gray-500'}
                    `}>
                        Found {filteredProducts.length} results for <span className="text-brand-black">"{searchQuery}"</span>
                    </p>
                </div>
             </div>

             {/* Results Grid - Reusing ProductGrid but forcing "All" filter to show raw results */}
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredProducts.length > 0 ? (
                    <ProductGrid 
                        products={filteredProducts} 
                        onProductClick={onProductClick} 
                        onQuickAdd={onQuickAdd} 
                        viewMode={viewMode}
                        initialFilter="All" // "All" means show everything passed in 'products' prop
                        showFilters={false} // Hide filters for simple search results view
                        compact={false}
                        defaultSort="artist-asc"
                    />
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="inline-block p-6 rounded-full bg-white mb-6 shadow-sm">
                            <Search size={48} className="text-gray-300" />
                        </div>
                        <h3 className="font-display text-2xl mb-3 text-gray-900">No matches found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            We couldn't find any products matching "{searchQuery}". Try checking for typos or using broader terms.
                        </p>
                        <button 
                            onClick={() => onNavigate('catalog', 'All')}
                            className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all
                                ${isRetro 
                                    ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-retro hover:shadow-retro-hover' 
                                    : 'bg-black text-white hover:bg-gray-800 shadow-lg'}
                            `}
                        >
                            Browse Full Catalog
                        </button>
                    </div>
                )}
             </div>
        </div>
    )
}
