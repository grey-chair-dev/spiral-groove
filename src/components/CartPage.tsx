
import React from 'react';
import { CartItem, ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Minus, Plus, Trash2, ArrowRight, Disc, CreditCard, Lock } from 'lucide-react';

interface CartPageProps {
  cartItems: CartItem[];
  viewMode: ViewMode;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (page: Page) => void;
  onCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ 
  cartItems, 
  viewMode, 
  onUpdateQuantity, 
  onRemoveItem, 
  onNavigate,
  onCheckout
}) => {
  const isRetro = viewMode === 'retro';

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className={`max-w-3xl mx-auto text-center py-20 px-8 border-2 border-dashed
             ${isRetro ? 'bg-brand-cream border-brand-black/20' : 'bg-gray-50 border-gray-200 rounded-xl'}
          `}>
             <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                <Disc size={96} />
             </div>
             <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Your Crate is Empty
             </h1>
             <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
                Silence is golden, but vinyl is better. Go find some gems.
             </p>
             <Button 
                variant={isRetro ? 'primary' : 'primary'}
                size="lg"
                onClick={() => onNavigate('catalog')}
             >
                Start Digging
             </Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
       <Section>
          <div className="max-w-6xl mx-auto">
             
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={() => onNavigate('home')}>Home</span> <span className="mx-1 opacity-50">/</span> Cart
                    </div>
                    <h1 className={`font-display text-4xl md:text-5xl ${isRetro ? 'text-white' : 'text-gray-900'}`}>Your Crate</h1>
                </div>
                <Button variant={isRetro ? 'outline' : 'ghost'} onClick={() => onNavigate('catalog')}>
                   Keep Shopping
                </Button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-6">
                   {cartItems.map((item) => {
                      const currentPrice = item.product.salePrice || item.product.price;
                      return (
                        <div key={item.product.id} className={`group relative p-4 sm:p-6 transition-all duration-300 flex flex-col sm:flex-row gap-6
                           ${isRetro 
                             ? 'bg-white border-2 border-brand-black shadow-retro hover:shadow-retro-hover' 
                             : 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md'}
                        `}>
                           
                           {/* Product Image */}
                           <div className={`w-full sm:w-28 h-28 flex-shrink-0 relative overflow-hidden
                               ${isRetro ? 'border-2 border-brand-black bg-black' : 'rounded-lg shadow-sm border border-gray-100'}
                           `}>
                               <img 
                                  src={item.product.coverUrl || getDefaultProductImage()} 
                                  alt={item.product.title} 
                                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110
                                      ${isRetro ? 'grayscale-[10%] group-hover:grayscale-0' : ''}
                                  `}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getDefaultProductImage();
                                  }}
                               />
                           </div>

                           {/* Details */}
                           <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start gap-4">
                                 <div>
                                    <h3 className={`font-display text-2xl leading-none mb-1 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                                        {item.product.title}
                                    </h3>
                                    <p className="font-bold text-sm text-gray-500 uppercase tracking-wide">
                                        {item.product.artist} • <span className={isRetro ? 'text-brand-orange' : 'text-gray-400'}>{item.product.format}</span>
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 mt-1">{item.product.condition} Condition</p>
                                 </div>
                                 <div className="text-right">
                                     <div className={`font-display text-2xl ${isRetro ? 'text-brand-black' : 'text-black'}`}>
                                         ${(currentPrice * item.quantity).toFixed(2)}
                                     </div>
                                     {item.quantity > 1 && (
                                         <div className="text-xs text-gray-400 font-bold">
                                             ${currentPrice.toFixed(2)} each
                                         </div>
                                     )}
                                 </div>
                              </div>

                              <div className="flex items-center justify-between mt-6 sm:mt-0">
                                  {/* Quantity Controls */}
                                  <div className={`flex items-center h-10 px-1 gap-1
                                     ${isRetro ? 'bg-brand-cream border-2 border-brand-black shadow-pop-sm' : 'bg-gray-50 rounded-lg border border-gray-200'}
                                  `}>
                                      <button 
                                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                                        className="w-8 h-full flex items-center justify-center hover:bg-black/5 transition-colors"
                                      >
                                          <Minus size={14} strokeWidth={3} />
                                      </button>
                                      <div className={`w-8 h-full flex items-center justify-center font-bold ${isRetro ? 'font-mono' : 'font-sans'}`}>
                                          {item.quantity}
                                      </div>
                                      <button 
                                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                                        className="w-8 h-full flex items-center justify-center hover:bg-black/5 transition-colors"
                                      >
                                          <Plus size={14} strokeWidth={3} />
                                      </button>
                                  </div>

                                  {/* Remove Button */}
                                  <button 
                                      onClick={() => onRemoveItem(item.product.id)}
                                      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors
                                         ${isRetro 
                                            ? 'text-brand-red hover:bg-brand-red hover:text-white border border-transparent hover:border-brand-black' 
                                            : 'text-red-500 hover:bg-red-50 rounded-lg'}
                                      `}
                                  >
                                      <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                                  </button>
                              </div>
                           </div>

                        </div>
                      );
                   })}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-4 sticky top-28">
                    <div className={`p-6 md:p-8
                        ${isRetro 
                            ? 'bg-brand-mustard border-2 border-brand-black shadow-retro' 
                            : 'bg-white border border-gray-200 rounded-xl shadow-lg'}
                    `}>
                        <h2 className="font-display text-2xl mb-6 pb-4 border-b border-black/10">Order Summary</h2>
                        
                        <div className="space-y-3 text-sm font-bold mb-6">
                            <div className="flex justify-between">
                                <span className="opacity-70">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Estimated Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-black/10 pt-4 mb-8">
                            <span className="font-display text-xl">Total</span>
                            <span className="font-display text-3xl text-brand-black">${total.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                fullWidth 
                                size="lg" 
                                onClick={onCheckout}
                                className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : 'shadow-md'}
                            >
                                <span className="flex items-center gap-2">Checkout <ArrowRight size={18} /></span>
                            </Button>
                            <p className="text-center text-[10px] uppercase font-bold tracking-wider opacity-60 flex items-center justify-center gap-2">
                                <Lock size={10} /> Secure Encryption
                            </p>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-black/10 text-center">
                            <div className="flex justify-center gap-2 mb-2 opacity-50">
                                <CreditCard size={20} />
                                <div className="w-8 h-5 border border-black/40 rounded bg-white"></div>
                                <div className="w-8 h-5 border border-black/40 rounded bg-white"></div>
                            </div>
                            <p className="text-xs font-medium opacity-60">We accept all major cards & Apple Pay</p>
                        </div>
                    </div>
                </div>

             </div>

          </div>
       </Section>
    </div>
  );
};
