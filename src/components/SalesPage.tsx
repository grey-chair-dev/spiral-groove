
import React from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Tag, Percent, ArrowRight } from 'lucide-react';

interface SalesPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({ viewMode, onNavigate }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Banner */}
      <div className="bg-brand-red text-white py-12 text-center border-b-4 border-brand-black overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <h1 className="font-display text-6xl md:text-8xl transform -rotate-2 drop-shadow-[4px_4px_0px_#000000]">SALE</h1>
          <p className="font-bold uppercase tracking-[0.3em] mt-2">Crate Diggers Special</p>
      </div>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Promo Card 1 */}
            <div className={`relative p-8 border-2 flex flex-col items-center text-center
                ${isRetro ? 'border-brand-black bg-brand-mustard shadow-pop' : 'border-gray-200 rounded-xl bg-yellow-50'}
            `}>
                <div className="absolute -top-4 bg-black text-white px-4 py-1 font-bold uppercase tracking-widest text-xs transform -rotate-3">Limited Time</div>
                <Tag size={48} className="mb-4 opacity-80" />
                <h3 className="font-display text-3xl mb-2">The Bargain Bin</h3>
                <p className="text-gray-800 font-medium mb-6">Deep cuts and hidden gems under $10. Perfect for sampling.</p>
                <Button 
                    variant={isRetro ? 'outline' : 'primary'} 
                    size="sm"
                    onClick={() => onNavigate('catalog', 'Bargain Bin')}
                >
                    Dig The Bin
                </Button>
            </div>

            {/* Promo Card 2 */}
            <div className={`relative p-8 border-2 flex flex-col items-center text-center
                ${isRetro ? 'border-brand-black bg-brand-teal text-white shadow-pop' : 'border-gray-200 rounded-xl bg-teal-50 text-teal-900'}
            `}>
                <Percent size={48} className="mb-4 opacity-80" />
                <h3 className="font-display text-3xl mb-2">Student Discount</h3>
                <p className="font-medium mb-6 opacity-90">Show your ID at the counter for 10% off new arrivals.</p>
                <div className="text-xs font-bold uppercase tracking-widest border-t border-white/30 pt-4 w-full">In-Store Only</div>
            </div>

             {/* Promo Card 3 */}
             <div className={`relative p-8 border-2 flex flex-col items-center text-center
                ${isRetro ? 'border-brand-black bg-brand-pink text-brand-black shadow-pop' : 'border-gray-200 rounded-xl bg-pink-50'}
            `}>
                <div className="absolute -top-4 bg-brand-red text-white px-4 py-1 font-bold uppercase tracking-widest text-xs transform rotate-2">Hot Deal</div>
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-4 font-bold text-xl">$5</div>
                <h3 className="font-display text-3xl mb-2">Mystery Bags</h3>
                <p className="font-medium mb-6 opacity-90">5 random 45s. Curated by genre. No scratches.</p>
                <Button 
                    variant={isRetro ? 'outline' : 'primary'} 
                    size="sm"
                    onClick={() => onNavigate('catalog', 'Mystery')}
                >
                    Grab One
                </Button>
            </div>
        </div>

        {/* Clearance Section */}
        <div className="mt-16 text-center">
            <h2 className="font-display text-4xl mb-4">Clearance Inventory</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                Last chance to grab these titles before they're gone forever. All clearance items are final sale.
            </p>
            
            <div className={`p-12 border-2 border-dashed flex flex-col items-center justify-center mb-8
                ${isRetro ? 'bg-brand-cream border-brand-black/20' : 'bg-gray-50 border-gray-200 rounded-xl'}
            `}>
                <h3 className="font-bold text-xl mb-4">Ready to hunt?</h3>
                <Button 
                    variant="primary"
                    onClick={() => onNavigate('catalog', 'Clearance')}
                >
                    View Clearance Items <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
      </Section>
    </div>
  );
};
