
import React, { useState, useMemo } from 'react';
import { Product, ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { ProductGrid } from './ProductGrid';
import { ArrowLeft, Disc, CheckCircle2, Truck, ShieldCheck, Share2, Heart } from 'lucide-react';
import { CategoryGroups, isProductStyleCategory } from '../types/productEnums';
import { getDefaultProductImage } from '../utils/defaultProductImage';

interface ProductDetailsPageProps {
  product: Product;
  viewMode: ViewMode;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  relatedProducts: Product[];
  onProductClick: (product: Product) => void;
  previousFilter?: string;
  onNavigate?: (page: Page, filter?: string, artist?: string) => void;
}

const SALES_FILTERS = ['Bargain Bin', 'On Sale', 'Clearance', 'Mystery'];

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ 
  product, 
  viewMode, 
  onAddToCart, 
  onBack,
  relatedProducts,
  onProductClick,
  previousFilter,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tracks'>('details');
  const isRetro = viewMode === 'retro';
  const isSoldOut = product.inStock === false;

  // Determine if this is a media product (vinyl/CD/cassette) vs merchandise/apparel
  const isMediaProduct = useMemo(() => {
    // Check tags first (most reliable)
    if (product.tags && product.tags.length > 0) {
      // If any tag is a product-style category (vinyl, CD, genres), it's media
      if (product.tags.some(tag => isProductStyleCategory(tag))) {
        return true;
      }
      // If any tag is a non-product-style category (apparel, equipment, etc.), it's NOT media
      const nonMediaCategories = [
        'cleaner', 'equipment', 'adapter', 'crate', 'sleeve', 'slip mat', 'spin clean',
        'poster', 'pin', 'sticker', 'button', 'patch', 't-shirt', 't-shirts', 'hat', 'hats', 'tote bag',
        'wallet', 'wallets', 'coffee mug', 'coaster', 'coasters', 'candle', 'candles', 
        'incense', 'essential oil', 'essential oils', 'lava lamp', 'lava lamps', 'bowl',
        'book', 'puzzle', 'videogame', 'videogames', 'drink', 'drinks', 'food',
        'action figure', 'action figures', 'funko pop', 'animal', 'animals', 'charm', 'charms',
        'jewelry', 'wristband', 'guitar pick', 'guitar picks', 'boombox',
        'miscellaneous', 'uncategorized'
      ];
      const category = product.tags[0]?.toLowerCase() || '';
      if (nonMediaCategories.some(nmc => category.includes(nmc))) {
        return false;
      }
    }
    
    // Check format for media types
    if (['LP', '12"', '7"', '10"', 'CD', 'Cassette', 'Reel to Reel', 'Vinyl', '2xLP', 'Box Set'].includes(product.format)) {
      return true;
    }
    
    // Default: if we can't determine, assume it's media (safer for existing products)
    return true;
  }, [product]);

  // Determine if this is specifically vinyl (for vinyl-specific features like tracklist)
  const isVinyl = useMemo(() => {
    if (!isMediaProduct) return false;
    
    const category = product.tags?.[0]?.toLowerCase() || '';
    
    // Check for explicit vinyl categories
    const vinylCategories = [
      ...CategoryGroups.VINYL.map(c => c.toLowerCase()),
      'new vinyl', 'used vinyl', '33new', '33used', '45', 'vinyl', 'lp'
    ];
    if (vinylCategories.some(vc => category.includes(vc) || category === vc)) {
      return true;
    }
    
    // Check if category is a genre (genres can be vinyl)
    const genres = ['rock', 'jazz', 'hip hop', 'blues', 'country', 'folk', 'electronic', 
                     'funk', 'soul', 'indie', 'metal', 'pop', 'punk', 'reggae', 'soundtrack',
                     'bluegrass', 'compilations', 'industrial', 'rap', 'singer songwriter'];
    if (genres.some(g => category.includes(g))) {
      return true;
    }
    
    // If format is vinyl-related
    if (['LP', '12"', '7"', '10"', 'Vinyl', '2xLP'].includes(product.format)) {
      return true;
    }
    
    return false;
  }, [product, isMediaProduct]);


  // Mock Tracklist based on Artist (Generic for demo) - only for vinyl
  const tracklist = [
    { num: 'A1', title: 'Intro / The Beginning', time: '1:45' },
    { num: 'A2', title: 'Walking Down Main St.', time: '3:22' },
    { num: 'A3', title: 'Neon Lights & Late Nights', time: '4:10' },
    { num: 'A4', title: 'Analog Dreams', time: '3:55' },
    { num: 'B1', title: 'Side B Opener', time: '2:30' },
    { num: 'B2', title: 'Dusty Grooves', time: '4:45' },
    { num: 'B3', title: 'The Deep Cut', time: '5:12' },
    { num: 'B4', title: 'Outro', time: '1:15' },
  ];

  const filterName = previousFilter && previousFilter !== 'All' ? previousFilter : 'Catalog';
  const isSalesPath = previousFilter && SALES_FILTERS.includes(previousFilter);
  const rootLabel = isSalesPath ? 'Sales' : 'Catalog';

  return (
    <div className="animate-in fade-in duration-500 min-h-screen">
      
      {/* Breadcrumb / Back Bar */}
      <div className={`border-b ${isRetro ? 'bg-brand-mustard border-brand-black' : 'bg-white border-gray-200'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <button 
              onClick={onBack}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors
                 ${isRetro ? 'text-brand-black hover:text-white' : 'text-gray-500 hover:text-black'}
              `}
            >
              <ArrowLeft size={14} strokeWidth={3} /> Back to {filterName}
            </button>
            <div className={`text-xs font-bold uppercase tracking-widest ${isRetro ? 'text-brand-black/60' : 'text-gray-400'} hidden sm:block`}>
               {rootLabel} {previousFilter && previousFilter !== 'All' ? `/ ${previousFilter}` : ''} / {product.title}
            </div>
         </div>
      </div>

      <Section className="pb-8 md:pb-16 bg-brand-cream/30">
        <div className={`grid grid-cols-1 ${isMediaProduct ? 'lg:grid-cols-12' : 'lg:grid-cols-2'} gap-6 lg:gap-12`}>
           
           {/* Left Column: Visuals */}
           <div className={isMediaProduct ? 'lg:col-span-8' : 'lg:col-span-1'}>
              <div className={`relative ${isMediaProduct ? 'aspect-square' : 'aspect-square max-w-lg mx-auto lg:mx-0'} w-full group select-none`}>
                 
                 {/* Product Image */}
                 <div className={`relative w-full h-full z-20 overflow-hidden bg-gray-100
                    ${isRetro 
                       ? isMediaProduct 
                         ? 'border-2 border-brand-black shadow-retro bg-white' 
                         : 'border-2 border-brand-black shadow-retro bg-white'
                       : 'border border-gray-300 rounded-lg'}
                 `}>
                    <img 
                      src={product.coverUrl || getDefaultProductImage()} 
                      alt={product.title} 
                      className={`w-full h-full object-cover transition-all duration-500
                         ${isSoldOut ? 'grayscale opacity-80' : ''}
                         ${!isMediaProduct && !isRetro ? 'rounded-lg' : ''}
                      `}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultProductImage();
                      }}
                    />
                    
                    {/* Sold Out Overlay */}
                    {isSoldOut && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <span className={`px-6 py-3 text-xl font-bold uppercase tracking-widest border-4 transform -rotate-12
                             ${isRetro ? 'bg-brand-red text-white border-brand-black shadow-pop' : 'bg-white text-black border-white'}
                          `}>
                             Sold Out
                          </span>
                       </div>
                    )}

                 </div>

              </div>
           </div>

           {/* Right Column: Info */}
           <div className={`${isMediaProduct ? 'lg:col-span-4' : 'lg:col-span-1'} flex flex-col h-full bg-brand-cream/50 lg:bg-brand-cream p-6 lg:p-8`}>
              
              {/* Product Tags */}
              <div className="mb-6">
                 <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags && product.tags.map((tag, idx) => {
                       if (isMediaProduct) {
                         // Media product tags (LP, 2 LP, CD, etc.) - black background
                         if (/^\d*\s*(LP|CD|Cassette|7"|12"|10"|45|Vinyl)/i.test(tag)) {
                            return (
                               <span key={idx} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-black text-white">
                                  {tag}
                               </span>
                            );
                         }
                         // Condition tags (Mint, Near Mint, etc.) - white background with border
                         if (/^(Mint|Near Mint|VG\+|VG|G\+|G|NM|NM-|VG-|G-|P|F)$/i.test(tag)) {
                            return (
                               <span key={idx} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white text-black border border-gray-300">
                                  {tag.toUpperCase()}
                               </span>
                            );
                         }
                         // Import or other special tags - teal background
                         if (/^(Import|Limited|Deluxe|Remastered|Reissue)$/i.test(tag)) {
                            return (
                               <span key={idx} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-teal text-white">
                                  {tag.toUpperCase()}
                               </span>
                            );
                         }
                       } else {
                         // Non-media product tags - simpler styling
                         return (
                            <span key={idx} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider 
                               ${isRetro ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-700'}
                            `}>
                               {tag}
                            </span>
                         );
                       }
                       return null;
                    })}
                    {product.isNewArrival && (
                       <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-teal text-white">
                          FRESH ARRIVAL
                       </span>
                    )}
                 </div>
              </div>

              {/* Product Title and Artist/Brand */}
              <div className="mb-6">
                 <h1 className={`font-display ${isMediaProduct ? 'text-3xl md:text-5xl' : 'text-3xl md:text-4xl'} leading-[0.9] mb-2 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                    {product.title}
                 </h1>
                 {isMediaProduct && product.artist && (
                   onNavigate ? (
                     <button
                       onClick={() => onNavigate('catalog', 'All', product.artist)}
                       className={`text-lg md:text-xl font-bold uppercase tracking-wide transition-colors hover:opacity-70 text-left ${isRetro ? 'text-brand-orange hover:text-brand-orange/80' : 'text-brand-teal hover:text-teal-600'}`}
                     >
                        {product.artist}
                     </button>
                   ) : (
                     <p className={`text-lg md:text-xl font-bold uppercase tracking-wide ${isRetro ? 'text-brand-orange' : 'text-brand-teal'}`}>
                        {product.artist}
                     </p>
                   )
                 )}
              </div>

              {/* Price Section */}
              <div className="mb-8">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">PRICE</span>
                       <div className={`font-header font-extrabold tabular-nums text-5xl ${isSoldOut ? 'text-gray-300 line-through decoration-brand-black' : 'text-gray-900'}`}>
                          ${product.price.toFixed(2)}
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-all">
                          <Heart size={20} />
                       </button>
                       <button className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-all">
                          <Share2 size={20} />
                       </button>
                    </div>
                 </div>
              </div>

              {/* Add to Crate Button */}
              <div className="mb-8">
                 <Button 
                   fullWidth 
                   size="lg" 
                   disabled={isSoldOut}
                   onClick={() => onAddToCart(product)}
                   className={`rounded-lg font-bold uppercase tracking-wider text-white transition-all
                      ${isSoldOut 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-brand-teal hover:bg-teal-600 shadow-md hover:shadow-lg'}
                   `}
                 >
                    {isSoldOut ? 'Join Waitlist' : 'ADD TO CRATE'}
                 </Button>
              </div>

              {/* Feature Icons */}
              <div className="flex flex-col gap-4 mb-10 text-[11px] font-bold uppercase tracking-widest text-gray-600">
                 <div className="flex items-center gap-2">
                    <Truck size={16} className="text-brand-teal" />
                    <span>LOCAL PICKUP</span>
                 </div>
                 {isMediaProduct && isVinyl && (
                   <>
                     <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-brand-teal" />
                        <span>GUARANTEED GRADING</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Disc size={16} className="text-brand-teal" />
                        <span>ULTRASONIC CLEANED</span>
                     </div>
                   </>
                 )}
              </div>

              {/* Tabs Section - Only for media products */}
              <div className="flex-1 min-h-[200px]">
                 {isMediaProduct ? (
                   <>
                     <div className="flex border-b border-gray-200 mb-6">
                        {isVinyl ? (
                          // Vinyl products: Show Details and Tracklist tabs
                          ['details', 'tracks'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`pb-3 pr-6 text-xs font-bold uppercase tracking-widest transition-colors relative
                                 ${activeTab === tab 
                                    ? 'text-gray-900' 
                                    : 'text-gray-400 hover:text-gray-600'}
                              `}
                            >
                              {tab === 'tracks' ? 'TRACKLIST' : 'THE DETAILS'}
                              {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-teal"></div>
                              )}
                            </button>
                          ))
                        ) : (
                          // Non-vinyl media products: Only show Details tab
                          <button
                            className="pb-3 pr-6 text-xs font-bold uppercase tracking-widest text-gray-900 relative"
                          >
                            THE DETAILS
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-teal"></div>
                          </button>
                        )}
                     </div>

                     <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'details' && (
                           <div className="space-y-4 text-sm leading-relaxed text-gray-600 font-medium">
                              {isVinyl ? (
                                <p>
                                  This is a <strong>{product.condition || 'Mint'}</strong> copy of {product.title} by {product.artist}. 
                                  {product.format && ` Pressed on ${product.format}.`}
                                  {product.releaseDate && ` Released around ${product.releaseDate.split('-')[0]}.`}
                                </p>
                              ) : (
                                <p>
                                  {product.title} by {product.artist}. 
                                  {product.format && ` Format: ${product.format}.`}
                                  {product.releaseDate && ` Released ${product.releaseDate.split('-')[0]}.`}
                                </p>
                              )}
                           </div>
                        )}

                        {isVinyl && activeTab === 'tracks' && (
                           <ul className="space-y-2">
                              {tracklist.map((track) => (
                                 <li key={track.num} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded cursor-default group">
                                    <div className="flex items-center gap-4">
                                       <span className="text-xs font-bold text-gray-400 w-6">{track.num}</span>
                                       <span className="font-medium text-gray-800 group-hover:text-brand-orange transition-colors">{track.title}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{track.time}</span>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="mb-6">
                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                           DESCRIPTION
                        </h3>
                     </div>
                     <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4 text-sm leading-relaxed text-gray-600 font-medium">
                          {product.description ? (
                            <p>{product.description}</p>
                          ) : (
                            <p>{product.title}</p>
                          )}
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {product.tags.map((tag, idx) => (
                                <span key={idx} className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md
                                   ${isRetro ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-700'}
                                `}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                     </div>
                   </>
                 )}
              </div>

           </div>
        </div>
      </Section>
    </div>
  );
};
