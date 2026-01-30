
import React from 'react';
import { ViewMode, Product } from '../../types';
import { Section } from './ui/Section';
import { Quote, Star } from 'lucide-react';
import type { StaffPick } from '../../types';

interface StaffPicksPageProps {
  viewMode: ViewMode;
  picks: StaffPick[];
  onProductClick: (product: Product) => void;
  onNavigate: (page: any, filter?: string) => void;
}

export const StaffPicksPage: React.FC<StaffPicksPageProps> = ({ viewMode, picks, onProductClick, onNavigate }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    <span className="cursor-pointer hover:text-brand-orange transition-colors" onClick={() => onNavigate('home')}>Home</span> <span className="mx-1 opacity-50">/</span> Staff Picks
                </div>
                <h1 className={`font-display text-5xl md:text-7xl mb-6 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Staff Rotations</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                    What we're spinning in the shop this week. 100% human curated, verified fresh.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {picks.map((pick, index) => (
                    <div 
                        key={`${pick.id}-${index}`} 
                        className="group cursor-pointer h-full"
                        onClick={() => onProductClick(pick)}
                    >
                        <div className={`relative flex flex-col h-full transition-transform duration-300 hover:-translate-y-2
                           ${isRetro 
                             ? 'bg-white p-6 border-2 border-brand-black shadow-retro group-hover:shadow-retro-hover' 
                             : 'bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md'}
                        `}>
                            
                            <div className="flex flex-col sm:flex-row gap-8">
                                {/* Album Art */}
                                <div className={`w-full sm:w-48 aspect-square flex-shrink-0 relative overflow-hidden
                                    ${isRetro ? 'border-2 border-brand-black bg-black' : 'rounded-lg shadow-md'}
                                `}>
                                    <img 
                                        src={pick.coverUrl} 
                                        alt={pick.title} 
                                        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110
                                            ${isRetro ? 'grayscale-[20%] group-hover:grayscale-0' : ''}
                                        `}
                                    />
                                    {isRetro && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="bg-brand-orange text-brand-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-brand-black">
                                                Highly Recommended
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className={`font-display text-3xl leading-none mb-1 group-hover:text-brand-orange transition-colors
                                            ${isRetro ? 'text-brand-black' : 'text-gray-900'}
                                        `}>
                                            {pick.title}
                                        </h3>
                                        <p className="font-bold text-sm text-gray-400 uppercase tracking-wide">{pick.artist}</p>
                                    </div>

                                    {/* Quote Bubble */}
                                    <div className={`relative p-5 text-lg leading-relaxed mb-6 flex-grow
                                        ${isRetro 
                                            ? 'bg-brand-mustard/30 text-brand-black font-hand border-2 border-brand-black transform -rotate-1 group-hover:rotate-0 transition-transform' 
                                            : 'bg-gray-50 text-gray-700 italic rounded-lg border-l-4 border-brand-teal pl-6'}
                                    `}>
                                        {!isRetro && <Quote size={16} className="text-brand-teal mb-2 opacity-50" />}
                                        "{pick.staffNote}"
                                    </div>

                                    {/* Staffer */}
                                    <div className={`flex items-center justify-between pt-4 border-t
                                        ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
                                    `}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 overflow-hidden
                                                ${isRetro ? 'border border-brand-black' : 'rounded-full shadow-sm ring-2 ring-white'}
                                            `}>
                                                <img src={pick.staffImage} alt="Spiral Groove Records staff pick" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Staff Pick</p>
                                            </div>
                                        </div>
                                        <div className={`flex gap-0.5 ${isRetro ? 'text-brand-orange' : 'text-brand-mustard'}`}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" stroke="none" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / CTA */}
            <div className={`mt-20 p-12 text-center border-2 border-dashed
                ${isRetro ? 'bg-brand-cream border-brand-black/20' : 'bg-gray-50 border-gray-200 rounded-xl'}
            `}>
                <h3 className="font-display text-2xl mb-2">Want more recommendations?</h3>
                <p className="text-gray-500 mb-6">Stop by the shop and ask us what's good. We love talking music.</p>
                <button 
                    onClick={() => onNavigate('locations')}
                    className={`inline-block px-8 py-3 font-bold uppercase tracking-wider transition-all
                    ${isRetro 
                        ? 'bg-brand-black text-white border-2 border-brand-black shadow-pop-sm hover:-translate-y-0.5' 
                        : 'bg-black text-white rounded-full hover:bg-gray-800'}
                    `}
                >
                    Visit The Shop
                </button>
            </div>

        </div>
      </Section>
    </div>
  );
};
