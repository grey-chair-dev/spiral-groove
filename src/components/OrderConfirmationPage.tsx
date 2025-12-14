
import React, { useEffect } from 'react';
import { ViewMode, Order, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { CheckCircle2, ArrowRight, MapPin, Calendar, Printer } from 'lucide-react';

interface OrderConfirmationPageProps {
  order: Order | null;
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
  onPrintReceipt: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, viewMode, onNavigate, onPrintReceipt }) => {
  const isRetro = viewMode === 'retro';

  // Scroll top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) return null;

  return (
    <div className="animate-in fade-in duration-700 pt-12 min-h-screen bg-gray-50/50">
      <Section>
        <div className="max-w-3xl mx-auto text-center">
            
            <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center animate-in zoom-in duration-500
               ${isRetro 
                 ? 'bg-brand-teal text-white border-2 border-brand-black shadow-retro' 
                 : 'bg-green-100 text-green-600 shadow-sm'}
            `}>
                <CheckCircle2 size={48} strokeWidth={3} />
            </div>

            <h1 className={`font-display text-5xl md:text-6xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Order Confirmed!
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-lg mx-auto leading-relaxed">
                Thanks for digging with us. We've sent a receipt to your email.
            </p>

            <div className={`p-8 md:p-12 text-left mb-12 relative overflow-hidden
               ${isRetro 
                 ? 'bg-white border-2 border-brand-black shadow-retro' 
                 : 'bg-white border border-gray-200 rounded-2xl shadow-lg'}
            `}>
                {/* Decorative receipt jagged edge for retro */}
                {isRetro && (
                   <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-black/5 to-transparent"></div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-dashed border-gray-300 mb-8">
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Order Number</span>
                        <span className="font-display text-2xl">{order.id}</span>
                    </div>
                    <div>
                         <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Paid</span>
                         <span className="font-display text-2xl">${order.total.toFixed(2)}</span>
                    </div>
                    <div>
                         <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Date</span>
                         <span className="font-bold">{order.date}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                           <MapPin size={16} className="text-brand-orange" /> Delivery Details
                        </h3>
                        <div className="text-sm text-gray-600 leading-relaxed">
                            {order.location === 'Milford Shop' ? (
                                <>
                                   <p className="font-bold text-black mb-1">Store Pickup</p>
                                   <p>Spiral Groove Records</p>
                                   <p>215B Main Street</p>
                                   <p>Milford, OH 45150</p>
                                   <p className="mt-2 text-xs text-brand-teal font-bold uppercase">Ready within 2 hours</p>
                                </>
                            ) : (
                                <>
                                   <p className="font-bold text-black mb-1">Shipping Address</p>
                                   <p>{order.location}</p>
                                   <p className="mt-2 text-xs text-gray-400">Via USPS Media Mail</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                           <Calendar size={16} className="text-brand-orange" /> What's Next?
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {order.location === 'Milford Shop' 
                               ? 'Wait for the "Ready for Pickup" email before heading over. Bring your ID!' 
                               : 'We will pack your order with care. You will receive a tracking number within 24 hours.'}
                        </p>
                        <button
                            type="button"
                            onClick={onPrintReceipt}
                            className="text-xs font-bold uppercase tracking-widest text-brand-orange hover:underline flex items-center gap-1"
                        >
                            <Printer size={12} /> Print Receipt
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                    size="lg" 
                    onClick={() => onNavigate('catalog')}
                    variant={isRetro ? 'primary' : 'primary'}
                >
                    Keep Digging <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button 
                    size="lg" 
                    variant={isRetro ? 'outline' : 'ghost'}
                    onClick={() => onNavigate('orders')}
                >
                    View Order History
                </Button>
            </div>

        </div>
      </Section>
    </div>
  );
};
