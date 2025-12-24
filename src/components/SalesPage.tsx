
import React from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';

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

      <Section viewMode={viewMode}>
        {/* Clearance Section */}
        <div className="mt-8 text-center">
            <h2 className={`font-display text-4xl mb-4 ${isRetro ? 'text-white' : ''}`}>Clearance Inventory</h2>
            <p className={`mb-8 max-w-xl mx-auto ${isRetro ? 'text-gray-300' : 'text-gray-500'}`}>
                Last chance to grab these titles before they're gone forever. All clearance items are final sale.
            </p>
            
            <div className={`p-12 border-2 border-dashed flex flex-col items-center justify-center mb-8
                ${isRetro ? 'bg-white/10 border-white/30' : 'bg-gray-50 border-gray-200 rounded-xl'}
            `}>
                <h3 className={`font-bold text-xl mb-4 ${isRetro ? 'text-white' : ''}`}>Ready to hunt?</h3>
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
