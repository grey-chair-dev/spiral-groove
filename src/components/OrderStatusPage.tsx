
import React, { useState } from 'react';
import { ViewMode, Page, Order } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Search, Package, Loader2, CheckCircle2, AlertCircle, MapPin, Clock } from 'lucide-react';
import { mapOrderStatus } from '../utils/orderStatus';

interface OrderStatusPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
  onViewReceipt: (order: Order) => void;
  initialOrderNumber?: string;
  initialEmail?: string;
}

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ 
  viewMode, 
  onNavigate, 
  onViewReceipt,
  initialOrderNumber,
  initialEmail
}) => {
  const isRetro = viewMode === 'retro';
  const [searchId, setSearchId] = useState(initialOrderNumber || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const hasAutoSearched = React.useRef(false);

  // Auto-lookup if props provided
  React.useEffect(() => {
    if (initialOrderNumber && initialEmail && !hasAutoSearched.current) {
        hasAutoSearched.current = true;
        handleLookup(new Event('submit') as any);
    }
  }, [initialOrderNumber, initialEmail]);

  const handleLookup = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(false);
    setResult(null);

    try {
        const queryParams = new URLSearchParams();
        // Support searching by either order number or email (or both)
        // Use state values directly (which might be initialized from props)
        const currentSearchId = searchId || initialOrderNumber;
        const currentEmail = email || initialEmail;

        if (currentSearchId) queryParams.append('order_number', currentSearchId);
        if (currentEmail) queryParams.append('email', currentEmail);

        if (!queryParams.toString()) {
            throw new Error('Please enter an order number or email');
        }

        const res = await fetch(`/api/orders?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && data.orders && data.orders.length > 0) {
            // Transform API order to UI Order type if needed
            // The API returns normalized data, let's map it
            const apiOrder = data.orders[0];
            const uiOrder: Order = {
                id: apiOrder.order_number || apiOrder.id,
                date: new Date(apiOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: mapOrderStatus(apiOrder.status), // Map DB status to UI status
                total: apiOrder.total_cents / 100,
                subtotal: apiOrder.total_cents / 100, // API might not return subtotal separate yet, using total for now
                tax: 0, // Calculated on frontend or needs to be stored
                items: apiOrder.items.map((item: any) => ({
                    title: item.name,
                    artist: 'Unknown', // Backend might not store artist for ad-hoc items
                    format: 'LP',
                    price: item.price
                })),
                location: 'Milford Shop'
            };
            setResult(uiOrder);
        } else {
            setError(true);
        }
    } catch (err) {
        console.error('Order lookup failed:', err);
        setError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-3xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={() => onNavigate('home')}>Home</span> <span className="mx-1 opacity-50">/</span> Status
                </div>
                <h1 className={`font-display text-4xl md:text-6xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Track Order</h1>
                <p className="text-lg text-gray-500 max-w-lg mx-auto">
                    Enter your order number and email address to see current status and pickup details.
                </p>
            </div>

            {/* Lookup Form */}
            <div className={`p-8 md:p-12 border-2 max-w-2xl mx-auto mb-16
                ${isRetro 
                    ? 'bg-white border-brand-black shadow-retro' 
                    : 'bg-white border-gray-200 rounded-2xl shadow-sm'}
            `}>
                <form onSubmit={handleLookup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">Order Number</label>
                        <div className="relative">
                            <Package size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                placeholder="e.g. #ORD-1234" 
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className={`w-full pl-12 pr-4 py-4 font-medium focus:outline-none transition-all
                                    ${isRetro 
                                    ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                    : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                `}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="you@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-4 font-medium focus:outline-none transition-all
                                ${isRetro 
                                ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                            `}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-brand-red text-sm font-bold bg-brand-red/5 p-3 rounded">
                            <AlertCircle size={16} />
                            <span>Order not found. Please check your details.</span>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        fullWidth 
                        size="lg" 
                        disabled={loading}
                        className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : 'shadow-md'}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Locating...</span>
                        ) : (
                            <span className="flex items-center gap-2"><Search size={18} /> Find Order</span>
                        )}
                    </Button>
                </form>
            </div>

            {/* Result View */}
            {result && (
                <div className={`animate-in slide-in-from-bottom-8 fade-in duration-500
                    ${isRetro 
                        ? 'bg-brand-mustard/20 border-2 border-brand-black p-8 relative' 
                        : 'bg-gray-50 border border-gray-200 rounded-2xl p-8'}
                `}>
                    {isRetro && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-black text-white px-4 py-1 font-bold uppercase text-xs tracking-widest transform -rotate-1 shadow-pop-sm">
                            Order Found
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
                        <div>
                            <h3 className="font-display text-3xl mb-1">{result.id}</h3>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Placed on {result.date}</p>
                        </div>
                        <div className={`px-4 py-2 flex items-center gap-2 font-bold uppercase tracking-wider text-sm
                            ${isRetro 
                                ? 'bg-brand-orange border-2 border-brand-black text-brand-black shadow-pop-sm' 
                                : 'bg-orange-100 text-orange-800 rounded-full px-6'}
                        `}>
                            <Clock size={16} /> {result.status}
                        </div>
                    </div>

                    {/* Progress Bar (Visual) */}
                    <div className="mb-10 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 -translate-y-1/2 z-0"></div>
                        <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-brand-teal -translate-y-1/2 z-0"></div>
                        <div className="relative z-10 flex justify-between">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center border-2 border-white shadow-sm"><CheckCircle2 size={16} /></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Ordered</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center border-2 border-white shadow-sm"><CheckCircle2 size={16} /></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Processing</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center border-2 border-white shadow-sm"><CheckCircle2 size={16} /></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Ready</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center border-2 border-white"><CheckCircle2 size={16} /></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Picked Up</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-300/50 mb-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-60">Items</h4>
                            <ul className="space-y-3">
                                {result.items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-sm font-medium">
                                        <span>{item.title}</span>
                                        <span className="opacity-60">{item.format}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-60">Pickup Location</h4>
                             <div className="flex items-start gap-3">
                                <MapPin className="text-brand-red flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold">Spiral Groove Records</p>
                                    <p className="text-sm opacity-80">215B Main Street</p>
                                    <p className="text-sm opacity-80">Milford, OH 45150</p>
                                    <p className="text-xs font-bold text-brand-orange mt-2 uppercase">Open Today: 11am - 7pm</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Button onClick={() => onViewReceipt(result)}>
                            View Full Receipt
                        </Button>
                    </div>

                </div>
            )}

        </div>
      </Section>
    </div>
  );
};
