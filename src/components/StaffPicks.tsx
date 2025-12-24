
import React from 'react';
import { StaffPick, ViewMode, Product } from '../../types';
import { Section } from './ui/Section';
import { Star, Quote } from 'lucide-react';

interface StaffPicksProps {
  picks: StaffPick[];
  viewMode: ViewMode;
  onProductClick: (product: Product) => void;
}

export const StaffPicks: React.FC<StaffPicksProps> = ({ picks, viewMode, onProductClick }) => {
  return (
    <Section className={viewMode === 'retro' ? "bg-brand-black text-brand-cream border-y-4 border-brand-orange" : "bg-brand-cream/50 text-brand-black"} viewMode={viewMode}>
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-brand-mustard font-bold uppercase tracking-widest text-xs mb-3">Curated By Humans</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold">Staff Rotations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {picks.map((pick) => (
          <div key={pick.id} className="relative group h-full cursor-pointer" onClick={() => onProductClick(pick)}>
            
            {/* Card Container */}
            <div className={`relative flex flex-col h-full transition-transform duration-300 hover:-translate-y-2
               ${viewMode === 'retro' 
                 ? 'bg-[#1a1a1a] p-4 border-2 border-brand-black shadow-retro group-hover:shadow-retro-hover' 
                 : 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100'}
            `}>
               
               <div className="flex gap-6 items-start">
                 {/* Album Art with Parallax-like Zoom */}
                 <div className={`w-32 h-32 flex-shrink-0 relative overflow-hidden flex items-center justify-center
                    ${viewMode === 'retro' ? 'border-2 border-brand-black bg-black' : 'rounded-lg shadow-md'}`}>
                    <img 
                      src={pick.coverUrl} 
                      alt={pick.title} 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-2 
                        ${viewMode === 'retro' ? 'grayscale-[20%]' : ''}`
                      } 
                    />
                    {viewMode === 'retro' && <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none"></div>}
                 </div>
                 
                 {/* Details */}
                 <div className="flex-1 min-w-0 z-10">
                    <h3 className="font-display font-bold text-2xl truncate leading-none mb-1 group-hover:text-brand-orange transition-colors">{pick.title}</h3>
                    <p className={`mb-4 font-bold text-xs uppercase tracking-wide ${viewMode === 'retro' ? 'text-gray-500' : 'text-gray-400'}`}>{pick.artist}</p>
                    
                    {/* The "Note" with Handwritten Font & Animation */}
                    <div className={`relative p-4 text-sm leading-relaxed transition-all duration-300 ease-out origin-top-left
                       ${viewMode === 'retro' 
                         ? 'bg-brand-mustard text-brand-black font-hand border-2 border-brand-black -rotate-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] group-hover:rotate-1 group-hover:scale-105 group-hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]' 
                         : 'bg-brand-teal/5 text-brand-black/80 rounded-lg group-hover:bg-brand-teal/10 font-medium'}
                    `}>
                       {viewMode !== 'retro' && (
                         <Quote size={12} className="absolute top-3 left-3 opacity-30 text-brand-teal" />
                       )}
                       <span className={`relative z-10 block ${viewMode !== 'retro' ? 'pl-4' : ''}`}>
                         {viewMode === 'retro' ? `"${pick.staffNote}"` : pick.staffNote}
                       </span>
                    </div>
                 </div>
               </div>

               {/* Staffer Info */}
               <div className={`mt-6 flex items-center justify-between border-t pt-4 ${viewMode === 'retro' ? 'border-white/10' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                     {/* Staff Image Parallax */}
                     <div className={`w-10 h-10 overflow-hidden relative
                       ${viewMode === 'retro' ? 'rounded-none border border-brand-black' : 'rounded-full ring-2 ring-white shadow-sm'}`}>
                       <img 
                         src={pick.staffImage} 
                         alt={pick.staffName} 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" 
                       />
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[9px] uppercase tracking-wider font-bold ${viewMode === 'retro' ? 'text-gray-500' : 'text-gray-400'}`}>Pick By</span>
                       <span className="font-bold text-xs">{pick.staffName}</span>
                     </div>
                  </div>
                  <div className={`flex gap-1 ${viewMode === 'retro' ? 'text-brand-orange' : 'text-brand-mustard'}`}>
                    <Star size={14} fill="currentColor" stroke="none" />
                    <Star size={14} fill="currentColor" stroke="none" />
                    <Star size={14} fill="currentColor" stroke="none" />
                    <Star size={14} fill="currentColor" stroke="none" />
                    <Star size={14} fill="currentColor" stroke="none" />
                  </div>
               </div>

            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
