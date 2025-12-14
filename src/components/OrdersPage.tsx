
import React, { useEffect, useState } from 'react';
import { ViewMode, Page, Order } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Package, Clock, CheckCircle2, Disc, MapPin, Store, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '../auth/StackAuthProvider'; // Import auth hook
import { mapOrderStatus } from '../utils/orderStatus';

interface OrdersPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
  onViewReceipt: (order: Order) => void;
  onLoginClick: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ viewMode, onNavigate, onViewReceipt, onLoginClick }) => {
  const isRetro = viewMode === 'retro';
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch orders by user email
        const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();

        if (data.success && data.orders) {
          // Map API orders to UI Order type
          const uiOrders: Order[] = data.orders.map((apiOrder: any) => ({
            id: apiOrder.order_number || apiOrder.id,
            date: new Date(apiOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: mapOrderStatus(apiOrder.status), // Map DB status to UI status
            total: apiOrder.total_cents / 100,
            subtotal: apiOrder.total_cents / 100,
            tax: 0,
            items: apiOrder.items.map((item: any) => ({
              title: item.name,
              artist: 'Unknown',
              format: 'LP',
              price: item.price
            })),
            location: 'Milford Shop'
          }));
          setOrders(uiOrders);
        } else {
            // No orders or error
            setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
      return (
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin mb-4 text-gray-400" size={32} />
              <p className="text-gray-500 font-medium">Loading your history...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-[50vh] flex flex-col items-center justify-center">
              <AlertCircle className="mb-4 text-brand-red" size={32} />
              <p className="text-gray-500 font-medium">{error}</p>
              <Button variant="link" onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
      );
  }

  if (!user) {
       return (
          <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
            <Section>
              <div className="max-w-3xl mx-auto text-center px-4 py-12 md:py-16">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6
                    ${isRetro ? 'bg-brand-orange border-2 border-brand-black text-brand-black' : 'bg-gray-100 text-gray-900'}
                  `}
                >
                  <Store size={32} />
                </div>
                <h2 className="font-display text-3xl mb-4">Sign in to view orders</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Log in with your email to see your past purchases, track status, and view receipts.
                </p>
                <Button onClick={onLoginClick}>
                  Sign In / Register
                </Button>
              </div>
            </Section>
          </div>
       );
  }

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
       <Section>
          <div className="max-w-4xl mx-auto">
             
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={() => onNavigate('home')}>Home</span> <span className="mx-1 opacity-50">/</span> Account
                    </div>
                    <h1 className={`font-display text-4xl md:text-5xl ${isRetro ? 'text-brand-black' : 'text-black'}`}>Order History</h1>
                    <p className="text-lg text-gray-600 mt-2 font-medium">View your collection history and check pickup status.</p>
                </div>
                <Button variant={isRetro ? 'outline' : 'outline'} onClick={() => onNavigate('catalog', 'All')}>
                   Continue Shopping
                </Button>
             </div>

             {/* Orders List */}
             {orders.length === 0 ? (
                 <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                     <Package size={48} className="mx-auto text-gray-300 mb-4" />
                     <h3 className="font-bold text-lg mb-2 text-gray-900">No orders yet</h3>
                     <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                     <Button onClick={() => onNavigate('catalog', 'All')}>Start Digging</Button>
                 </div>
             ) : (
             <div className="space-y-8">
                {orders.map((order) => (
                   <div key={order.id} className={`group relative p-6 md:p-8 transition-all duration-300
                      ${isRetro 
                        ? 'bg-white border-2 border-brand-black shadow-retro hover:shadow-retro-hover' 
                        : 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md'}
                   `}>
                      
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Number</span>
                            <span className="font-bold text-lg font-mono">{order.id}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date Placed</span>
                            <span className="font-medium">{order.date}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                            <span className={`font-bold text-lg ${isRetro ? 'font-display text-brand-black' : ''}`}>${order.total.toFixed(2)}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                            <div className="flex items-center gap-2">
                               {order.status === 'picked_up' ? (
                                  <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                                     ${isRetro 
                                       ? 'bg-brand-teal text-white border border-brand-black' 
                                       : 'bg-green-100 text-green-700 rounded-full'}
                                  `}>
                                     <CheckCircle2 size={14} /> Picked Up
                                  </div>
                               ) : order.status === 'ready' ? (
                                  <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                                     ${isRetro 
                                       ? 'bg-brand-orange text-brand-black border border-brand-black animate-pulse' 
                                       : 'bg-orange-100 text-orange-800 rounded-full animate-pulse'}
                                  `}>
                                     <Store size={14} /> Ready at Store
                                  </div>
                               ) : (
                                  <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                                     ${isRetro 
                                       ? 'bg-brand-mustard text-brand-black border border-brand-black' 
                                       : 'bg-yellow-100 text-yellow-800 rounded-full'}
                                  `}>
                                     <Clock size={14} /> Confirmed
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* Order Items */}
                      <div className="py-6 space-y-4">
                         {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 flex items-center justify-center
                                     ${isRetro ? 'bg-gray-100 border border-brand-black' : 'bg-gray-50 rounded-lg'}
                                  `}>
                                     <Disc size={20} className="text-gray-400" />
                                  </div>
                                  <div>
                                     <div className="font-bold text-sm">{item.title}</div>
                                     <div className="text-xs text-gray-500 uppercase tracking-wide">{item.artist} • {item.format}</div>
                                  </div>
                               </div>
                               {order.status === 'picked_up' && (
                                   <Button variant="link" size="sm" className="hidden sm:block">Write Review</Button>
                               )}
                            </div>
                         ))}
                      </div>

                      {/* Footer / Location */}
                      <div className={`pt-6 mt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                         ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
                      `}>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin size={16} className="text-brand-orange" />
                            <span className="font-bold">Pickup Location:</span>
                            <span className="font-medium">{order.location}</span>
                            {order.status === 'ready' && (
                                <span className="text-xs text-brand-orange font-bold uppercase ml-2">(Bring ID)</span>
                            )}
                         </div>
                         
                         <div className="flex gap-3 w-full sm:w-auto">
                            <Button 
                                fullWidth 
                                size="sm" 
                                variant={isRetro ? 'secondary' : 'outline'}
                                onClick={() => onViewReceipt(order)}
                            >
                                View Receipt
                            </Button>
                            {order.status === 'ready' && (
                                <Button 
                                    fullWidth 
                                    size="sm" 
                                    variant={isRetro ? 'primary' : 'primary'}
                                    onClick={() => onNavigate('locations')}
                                >
                                    Get Directions
                                </Button>
                            )}
                         </div>
                      </div>

                   </div>
                ))}
             </div>
             )}
             
             {/* Empty State Help */}
             {orders.length > 0 && (
             <div className="mt-16 text-center">
                 <p className="text-gray-500 text-sm mb-4">Don't see an older order?</p>
                 <Button variant="link" onClick={() => onNavigate('about')}>Contact Support</Button>
             </div>
             )}

          </div>
       </Section>
    </div>
  );
};
