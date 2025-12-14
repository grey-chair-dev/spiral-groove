
import React, { useState, useEffect, useRef } from 'react';
import { CartItem, ViewMode, User } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { ArrowLeft, Lock, CreditCard, Store, MapPin, User as UserIcon, Ghost } from 'lucide-react';
import { loadSquareSdk } from '../utils/loadSquareSdk';
import { initializeSquarePayments, generatePaymentToken, processPayment, SquarePayments, SquareCard } from '../services/squarePayment';

interface CheckoutPageProps {
  cartItems: CartItem[];
  viewMode: ViewMode;
  user: User | null;
  onLoginClick: () => void;
  onBack: () => void;
  onPlaceOrder: (orderDetails: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ 
  cartItems, 
  viewMode, 
  user,
  onLoginClick,
  onBack,
  onPlaceOrder
}) => {
  const isRetro = viewMode === 'retro';
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [squarePayments, setSquarePayments] = useState<SquarePayments | null>(null);
  const [cardElement, setCardElement] = useState<SquareCard | null>(null);
  // Ref to track card element for cleanup without closure staleness
  const cardElementRef = useRef<SquareCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const cardAttachedRef = useRef(false);
  // Use a unique ID to prevent conflicts with React re-renders/strict mode
  const containerId = useRef(`card-container-${Math.random().toString(36).substr(2, 9)}`);

  // Sync ref with state
  useEffect(() => {
    cardElementRef.current = cardElement;
  }, [cardElement]);

  // Auth Wall Logic
  const showAuthWall = !user && !isGuest;

  // Initialize Square SDK
  useEffect(() => {
    // Only initialize if we're past the auth wall and not already initialized
    if (showAuthWall || isInitialized.current) return;
    
    const init = async () => {
      try {
        await loadSquareSdk();
        
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          setError('Square configuration missing');
          return;
        }

        const payments = await initializeSquarePayments(appId, locationId);
        if (!payments) {
          setError('Failed to initialize Square payments');
          return;
        }
        
        setSquarePayments(payments);
        isInitialized.current = true;
      } catch (err) {
        console.error('Square initialization error:', err);
        setError('Failed to load payment form');
      }
    };

    init();
  }, [showAuthWall]);

  // Callback ref - called when element is mounted/unmounted
  // Wrapped in useCallback to prevent recreation on every render
  const cardContainerCallbackRef = React.useCallback((element: HTMLDivElement | null) => {
    cardContainerRef.current = element;
    
    // If element is removed, cleanup
    if (!element) {
      if (cardElementRef.current) {
        cardElementRef.current.destroy().catch(console.error);
        setCardElement(null);
        cardElementRef.current = null;
      }
      cardAttachedRef.current = false;
      return;
    }
    
    // Ensure element has the unique ID
    if (element.id !== containerId.current) {
      element.id = containerId.current;
    }
    
    // Try to attach when element is mounted
    // Note: We use refs for dependencies here to avoid needing to recreate the callback
    // when state changes, as long as we check the values at execution time.
    if (element && !cardAttachedRef.current && !showAuthWall) {
      // Check for payments in a slight delay to allow state to settle if needed
      // or if this callback fires before payments are ready
      const attachCard = async () => {
        try {
          // We need to access the *current* squarePayments. 
          // Since this callback is memoized, we can't depend on the closure variable 
          // if it changes. However, we'll trigger this from the useEffect below 
          // if payments aren't ready yet.
          
          // If we have payments in the closure (if recreated) or we can access it differently.
          // Actually, let's rely on the useEffect to trigger attachment if payments 
          // aren't ready when the element mounts.
          // But if payments ARE ready, we should attach now.
          
          // To safely access the latest squarePayments without recreating the callback,
          // we would need a ref for it. But for now, let's just let the useEffect handle
          // the attachment if payments are missing here.
          
          // Re-check global state/props if possible, or rely on the effect.
        } catch (err) {
           // ...
        }
      };
    }
  }, [showAuthWall]); // Only recreate if auth wall changes

  // Effect to attach card when squarePayments becomes available OR element exists
  useEffect(() => {
    if (!squarePayments || showAuthWall || cardAttachedRef.current) return;
    
    const element = cardContainerRef.current;
    if (!element) return; // Element not ready
    
    // Element exists, try to attach
    const attachCard = async () => {
      try {
        if (element.id !== containerId.current) {
          element.id = containerId.current;
        }
        
        // Wait for element to be fully connected to DOM
        const waitForConnection = (): Promise<void> => {
          return new Promise((resolve) => {
            if (element.isConnected && document.body.contains(element)) {
              resolve();
              return;
            }
            
            // Check every frame
            const checkConnection = () => {
              if (element.isConnected && document.body.contains(element)) {
                resolve();
              } else {
                requestAnimationFrame(checkConnection);
              }
            };
            requestAnimationFrame(checkConnection);
            
            // Timeout after 2 seconds
            setTimeout(() => {
              resolve(); // Resolve anyway to avoid hanging
            }, 2000);
          });
        };
        
        await waitForConnection();
        
        // Additional wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const elementInDom = document.getElementById(containerId.current);
        if (!elementInDom || elementInDom !== element) {
          return;
        }
        
        if (cardAttachedRef.current) return;
        
        const card = await squarePayments.card();
        // Use CSS selector format with # prefix
        await card.attach(`#${containerId.current}`);
        setCardElement(card);
        cardElementRef.current = card;
        cardAttachedRef.current = true;
      } catch (err) {
        console.error('Square card attachment error:', err);
        setError('Failed to load payment form');
      }
    };
    
    attachCard();
  }, [squarePayments, showAuthWall]);

  // Cleanup on unmount or when auth wall shows
  useEffect(() => {
    if (showAuthWall && cardElementRef.current) {
      cardElementRef.current.destroy().catch(console.error);
      setCardElement(null);
      cardElementRef.current = null;
      cardAttachedRef.current = false;
    }
    
    return () => {
      if (cardElementRef.current) {
        cardElementRef.current.destroy().catch(console.error);
        setCardElement(null);
        cardElementRef.current = null;
        cardAttachedRef.current = false;
      }
    };
  }, [showAuthWall]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    
    try {
        if (!cardElement) {
            throw new Error('Payment form not ready');
        }

        // 1. Get Token from Square
        const tokenResult = await generatePaymentToken(cardElement);
        
        if (!tokenResult.success || !tokenResult.token) {
            throw new Error(tokenResult.error || 'Invalid card details');
        }

        // 2. Gather Order Data
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const pickupForm = {
            firstName: (formData.get('fullName') as string).split(' ')[0],
            lastName: (formData.get('fullName') as string).split(' ').slice(1).join(' ') || '',
            email: formData.get('email') as string,
            phone: formData.get('phone') as string
        };

        // 3. Process Payment on Backend
        const result = await processPayment(
            tokenResult.token,
            Math.round(total * 100), // Amount in cents
            {
                pickupForm,
                cartItems: cartItems.map(item => ({
                    id: item.product.id,
                    name: item.product.title,
                    quantity: item.quantity,
                    price: item.product.salePrice || item.product.price
                }))
            }
        );

        if (result.success) {
            onPlaceOrder({
                ...pickupForm,
                deliveryMethod: 'pickup',
                subtotal,
                tax,
                total,
                shippingCost: 0,
                orderNumber: result.orderId // Pass back the real order ID/Number
            });
        } else {
            throw new Error(result.error || 'Payment failed');
        }

    } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.message || 'An error occurred during checkout');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen bg-gray-50/50">
       <Section>
          {showAuthWall ? (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <button 
                        onClick={onBack}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4
                            ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                        `}
                    >
                        <ArrowLeft size={14} strokeWidth={3} /> Back to Cart
                    </button>
                    <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                        Checkout
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Login Option */}
                    <div className={`p-8 md:p-12 flex flex-col items-center text-center border-2
                        ${isRetro 
                            ? 'bg-white border-brand-black shadow-retro' 
                            : 'bg-white border-gray-200 rounded-xl shadow-sm'}
                    `}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                            ${isRetro ? 'bg-brand-orange border-2 border-brand-black text-brand-black' : 'bg-gray-100 text-gray-900'}
                        `}>
                            <UserIcon size={32} />
                        </div>
                        <h2 className="font-display text-2xl mb-3">Returning Customer?</h2>
                        <p className="text-gray-500 mb-8 max-w-xs">
                            Sign in to access your saved details and earn rewards on this purchase.
                        </p>
                        <Button onClick={onLoginClick} fullWidth>
                            Sign In / Register
                        </Button>
                    </div>

                    {/* Guest Option */}
                    <div className={`p-8 md:p-12 flex flex-col items-center text-center border-2
                        ${isRetro 
                            ? 'bg-brand-cream border-brand-black shadow-retro' 
                            : 'bg-gray-50 border-gray-200 rounded-xl'}
                    `}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                            ${isRetro ? 'bg-white border-2 border-brand-black text-gray-400' : 'bg-white text-gray-400 shadow-sm'}
                        `}>
                            <Ghost size={32} />
                        </div>
                        <h2 className="font-display text-2xl mb-3">Guest Checkout</h2>
                        <p className="text-gray-500 mb-8 max-w-xs">
                            No account? No problem. You can always create one later.
                        </p>
                        <Button variant={isRetro ? 'outline' : 'secondary'} onClick={() => setIsGuest(true)} fullWidth>
                            Continue as Guest
                        </Button>
                    </div>
                </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
             
             {/* Header */}
             <div className="mb-8">
                 <button 
                  onClick={onBack}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4
                     ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                  `}
                >
                  <ArrowLeft size={14} strokeWidth={3} /> Back to Cart
                </button>
                <h1 className={`font-display text-4xl md:text-5xl ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Checkout</h1>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                
                {/* Left Column: Forms */}
                <div className="lg:col-span-7">
                   <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                       
                       {/* 1. Contact Info */}
                       <div className={`p-6 md:p-8 relative
                           ${isRetro 
                            ? 'bg-white border-2 border-brand-black shadow-retro' 
                            : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                       `}>
                           <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                               <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                                   ${isRetro ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black'}
                               `}>1</span>
                               Contact
                           </h2>
                           <div className="grid grid-cols-1 gap-4">
                               {/* Name */}
                               <input 
                                   name="fullName"
                                   type="text" 
                                   placeholder="Full Name" 
                                   required 
                                   defaultValue={user?.name || ''}
                                   className={`w-full p-4 font-medium focus:outline-none transition-all
                                       ${isRetro 
                                         ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                         : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                   `}
                               />

                               {/* Email & Phone */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <input 
                                       name="email"
                                       type="email" 
                                       placeholder="Email Address" 
                                       required 
                                       defaultValue={user?.email || ''}
                                       className={`w-full p-4 font-medium focus:outline-none transition-all
                                           ${isRetro 
                                             ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                             : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                       `}
                                   />
                                   <input 
                                       name="phone"
                                       type="tel" 
                                       placeholder="Phone Number" 
                                       required 
                                       defaultValue={user?.phone || ''}
                                       className={`w-full p-4 font-medium focus:outline-none transition-all
                                           ${isRetro 
                                             ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                             : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                       `}
                                   />
                               </div>

                               <div className="flex items-center gap-2">
                                   <input type="checkbox" id="newsletter" className="w-4 h-4 accent-brand-orange" />
                                   <label htmlFor="newsletter" className="text-sm text-gray-600 font-medium cursor-pointer">Keep me updated on new arrivals and events.</label>
                               </div>
                           </div>
                       </div>

                       {/* 2. Delivery Method */}
                       <div className={`p-6 md:p-8 relative
                           ${isRetro 
                            ? 'bg-white border-2 border-brand-black shadow-retro' 
                            : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                       `}>
                           <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                               <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                                   ${isRetro ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black'}
                               `}>2</span>
                               Pickup Details
                           </h2>
                           
                           <div className={`p-4 text-sm flex items-start gap-3
                               ${isRetro ? 'bg-brand-teal/10 border-2 border-brand-teal' : 'bg-gray-50 rounded-lg border border-gray-200'}
                           `}>
                               <MapPin className="text-brand-teal flex-shrink-0" size={20} />
                               <div>
                                   <p className="font-bold mb-1">Pickup Location:</p>
                                   <p>215B Main Street, Milford, OH, United States, 45150</p>
                                   <p className="mt-2 text-xs opacity-70">Bring your ID and order confirmation when you arrive.</p>
                               </div>
                           </div>
                       </div>

                       {/* 3. Payment */}
                       <div className={`p-6 md:p-8 relative
                           ${isRetro 
                            ? 'bg-white border-2 border-brand-black shadow-retro' 
                            : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                       `}>
                           <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                               <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                                   ${isRetro ? 'bg-brand-black text-white border-brand-black' : 'bg-black text-white border-black'}
                               `}>3</span>
                               Payment
                           </h2>

                           <div className={`p-4 mb-6 text-sm flex items-center gap-2
                               ${isRetro ? 'bg-brand-cream border border-brand-black/20' : 'bg-gray-50 text-gray-500 rounded-lg'}
                           `}>
                               <Lock size={16} /> 
                               <span>All transactions are secure and encrypted.</span>
                           </div>

                           <div className="space-y-4">
                               {/* Square Card Container */}
                               <div 
                                   id={containerId.current}
                                   ref={cardContainerCallbackRef}
                                   className={`min-h-[100px] p-4 transition-all
                                       ${isRetro 
                                         ? 'bg-brand-cream border-2 border-brand-black' 
                                         : 'bg-white border border-gray-200 rounded-lg'}
                                   `}
                               ></div>
                               {/* Error Message Display */}
                               {error && (
                                   <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded border border-red-200">
                                       {error}
                                   </div>
                               )}
                           </div>
                       </div>
                       
                   </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                    <div className={`p-6 md:p-8
                        ${isRetro 
                            ? 'bg-brand-mustard border-2 border-brand-black shadow-retro' 
                            : 'bg-white border border-gray-200 rounded-xl shadow-lg'}
                    `}>
                        <h2 className="font-display text-2xl mb-6 pb-4 border-b border-black/10">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.product.id} className="flex gap-4">
                                    <div className={`w-12 h-12 flex-shrink-0 relative overflow-hidden
                                        ${isRetro ? 'border border-brand-black' : 'rounded-md border border-gray-100'}
                                    `}>
                                        <img src={item.product.coverUrl} alt={item.product.title} className="w-full h-full object-cover" />
                                        <div className={`absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white
                                            ${isRetro ? 'bg-brand-black' : 'bg-black rounded-tl-md'}
                                        `}>
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{item.product.title}</p>
                                        <p className="text-xs opacity-70 truncate">{item.product.artist}</p>
                                    </div>
                                    <div className="font-bold text-sm">
                                        ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm font-bold mb-6 pt-4 border-t border-black/10">
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

                        <Button 
                            fullWidth 
                            size="lg" 
                            disabled={isProcessing}
                            onClick={(e) => {
                                const form = document.getElementById('checkout-form') as HTMLFormElement;
                                if (form) form.requestSubmit();
                            }}
                            className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : 'shadow-md'}
                        >
                            {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                        </Button>
                    </div>
                </div>

             </div>

            </div>
          )}
       </Section>
    </div>
  );
};
