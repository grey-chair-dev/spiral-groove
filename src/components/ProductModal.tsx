
import React from 'react';
import { Product } from '../../types';
import { X, CheckCircle2, Disc, Music2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { getDefaultProductImage } from '../utils/defaultProductImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const isSoldOut = product.inStock === false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Container - widened to 4xl for better 2-col layout */}
      <div className="relative bg-brand-cream w-full max-w-4xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-2 border-brand-black flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
        
        {/* Close Button - Absolute positioning */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-brand-cream hover:bg-brand-red hover:text-white border-2 border-brand-black transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-full group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Left Column: Album Art */}
        <div className="w-full md:w-1/2 bg-black relative flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-brand-black overflow-hidden group h-48 sm:h-64 md:h-auto">
            {/* Image fills the container */}
            <div className="relative w-full h-full">
                <img 
                src={product.coverUrl || getDefaultProductImage()} 
                alt={product.title} 
                className={`w-full h-full object-cover transition-all duration-500
                   ${isSoldOut ? 'grayscale opacity-70' : 'grayscale-[10%] group-hover:grayscale-0'}
                `}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultProductImage();
                }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                
                {isSoldOut ? (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="px-6 py-3 bg-brand-red text-white border-2 border-brand-black transform -rotate-12 shadow-[4px_4px_0px_#231F20] text-lg font-bold uppercase tracking-widest">
                           Sold Out
                       </div>
                   </div>
                ) : (
                  <>
                    {/* Vinyl overlay decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border-[1px] border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] bg-brand-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none shadow-xl">
                      <div className="w-2 h-2 bg-brand-cream rounded-full"></div>
                    </div>
                  </>
                )}
            </div>
            
            {/* Mobile Tag overlay */}
            <div className="absolute bottom-4 left-4 md:hidden">
                <span className="bg-brand-orange text-brand-black px-3 py-1 text-xs font-bold uppercase tracking-wider border border-brand-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {product.format}
                </span>
            </div>
        </div>
        
        {/* Right Column: Product Details */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-brand-cream overflow-y-auto">
          
          <div className="flex-1">
             {/* Header Info */}
             <div className="mb-6">
                <div className="hidden md:flex flex-wrap gap-2 mb-4">
                    <span className="bg-brand-black text-brand-cream px-3 py-1 text-xs font-bold uppercase tracking-wider transform -rotate-1 border border-transparent">
                        {product.format}
                    </span>
                    <span className="bg-brand-cream text-brand-black px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-brand-black">
                        {product.condition}
                    </span>
                    {!isSoldOut && product.isNewArrival && (
                        <span className="bg-brand-teal text-white px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-brand-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            Fresh
                        </span>
                    )}
                </div>

                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-[0.9] text-brand-black">
                    {product.title}
                </h2>
                <p className="font-header text-lg sm:text-xl md:text-2xl font-bold text-gray-500 uppercase tracking-wide">
                    {product.artist}
                </p>
             </div>

             {/* Description & Metadata */}
             <div className="space-y-6 mb-8">
                <div className="p-4 bg-white border-2 border-brand-black/10 rounded-lg">
                    {isSoldOut ? (
                      <div className="flex items-start gap-3 mb-3 text-brand-red">
                        <AlertCircle size={18} className="mt-0.5" />
                         <p className="text-sm font-bold leading-relaxed">
                            This item is currently out of stock.
                         </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 mb-3">
                          <CheckCircle2 size={18} className="text-brand-green mt-0.5 text-brand-teal" />
                          <p className="text-sm font-medium leading-relaxed text-gray-700">
                              <strong>Verified Clean:</strong> This copy has been sonically graded. Jacket shows minimal wear. {product.condition === 'Mint' ? 'Looks unplayed.' : 'Some ring wear on sleeve.'}
                          </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-dashed border-gray-200 pt-3 mt-1">
                        <span className="flex items-center gap-1"><Disc size={14} /> {product.genre}</span>
                        <span className="flex items-center gap-1"><Music2 size={14} /> 2015 Pressing</span>
                    </div>
                </div>

                <div className="font-hand text-brand-black/80 text-sm leading-6 relative pl-4 border-l-4 border-brand-mustard">
                    "Essential listening. One of those records you need to own on wax to truly appreciate the low end."
                    <span className="block mt-2 font-sans font-bold text-xs uppercase text-gray-400">— Staff Notes</span>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t-2 border-brand-black/10">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Price</span>
                    <div className={`font-header font-extrabold tabular-nums text-4xl drop-shadow-[2px_2px_0px_#231F20] ${isSoldOut ? 'text-gray-400 line-through decoration-brand-black decoration-4' : 'text-brand-black'}`}>
                        ${product.price.toFixed(2)}
                    </div>
                </div>
                
                <div className="w-full sm:w-auto">
                    <Button 
                        fullWidth 
                        variant={isSoldOut ? "secondary" : "primary"}
                        size="lg"
                        disabled={isSoldOut}
                        onClick={() => !isSoldOut && onAddToCart(product)} 
                        className={isSoldOut 
                          ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400 text-gray-500 shadow-none hover:translate-y-0 hover:shadow-none" 
                          : "shadow-[4px_4px_0px_#231F20] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#231F20] active:translate-y-1 active:shadow-none transition-all"
                        }
                    >
                        {isSoldOut ? 'Sold Out' : 'Add to Crate'}
                    </Button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
