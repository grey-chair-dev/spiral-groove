
import React, { useState } from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { CheckCircle2, XCircle, DollarSign, AlertCircle } from 'lucide-react';

interface WeBuyPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
}

export const WeBuyPage: React.FC<WeBuyPageProps> = ({ viewMode, onNavigate }) => {
  const isRetro = viewMode === 'retro';
  const [showContactTip, setShowContactTip] = useState(false);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Hero */}
      <div className={`relative py-20 md:py-32 overflow-hidden border-b-2
         ${isRetro ? 'bg-brand-mustard border-brand-black' : 'bg-gray-50 border-gray-200'}
      `}>
         {/* Texture Overlay */}
         {isRetro && (
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
         )}
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] 
                   ${isRetro 
                     ? 'bg-brand-black text-white transform -rotate-2 inline-block shadow-pop-sm' 
                     : 'bg-black text-white rounded-full'}
                `}>
                   Turn Records Into Cash
                </span>
             </div>
             
             <h1 className={`font-display text-5xl md:text-7xl lg:text-8xl mb-8 leading-[0.9]
                ${isRetro ? 'text-brand-black drop-shadow-[3px_3px_0px_#FFF]' : 'text-black'}
             `}>
                We Buy Used Vinyl.
             </h1>
             
             <p className="text-xl md:text-2xl font-medium text-gray-700 max-w-2xl mx-auto leading-relaxed mb-10">
                Bring in what you’ve got, or contact us first with details and photos.
             </p>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                    variant={isRetro ? 'primary' : 'primary'} 
                    size="lg"
                    onClick={() => onNavigate('locations')}
                >
                    Get Directions
                </Button>
                <Button 
                    variant={isRetro ? 'outline' : 'outline'} 
                    size="lg"
                    onClick={() => onNavigate('contact')}
                >
                    Contact Us
                </Button>
             </div>
         </div>
      </div>

      <Section>
         {/* How It Works */}
         <div className="mb-24">
             <div className="text-center mb-16">
                 <h2 className="font-display text-4xl mb-4">How It Works</h2>
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Simple. Fast. Transparent.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                 <div className="flex flex-col items-center text-center">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-3xl font-display
                        ${isRetro ? 'bg-brand-cream border-2 border-brand-black shadow-retro text-brand-black' : 'bg-gray-100 text-black'}
                     `}>1</div>
                     <h3 className="text-xl font-bold mb-3">Bring Them In</h3>
                     <p className="text-gray-600 leading-relaxed">
                        Stop by the shop during open hours, or contact us first with details (approx. count, genres, condition, photos).
                     </p>
                 </div>
                 <div className="flex flex-col items-center text-center">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-3xl font-display
                        ${isRetro ? 'bg-brand-teal border-2 border-brand-black shadow-retro text-white' : 'bg-gray-100 text-black'}
                     `}>2</div>
                     <h3 className="text-xl font-bold mb-3">We Appraise</h3>
                     <p className="text-gray-600 leading-relaxed">
                        We’ll take a look and make an offer based on condition, demand, and what we can stock.
                     </p>
                 </div>
                 <div className="flex flex-col items-center text-center">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-3xl font-display
                        ${isRetro ? 'bg-brand-orange border-2 border-brand-black shadow-retro text-brand-black' : 'bg-gray-100 text-black'}
                     `}>3</div>
                     <h3 className="text-xl font-bold mb-3">Get Paid</h3>
                     <p className="text-gray-600 leading-relaxed">
                        Choose cash or store credit.
                     </p>
                 </div>
             </div>
         </div>

         {/* What We Buy / Don't Buy */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start mb-24">
             <div className={`p-8 md:p-12 border-2 ${isRetro ? 'border-brand-black bg-brand-cream shadow-retro' : 'border-gray-200 rounded-2xl bg-gray-50'}`}>
                 <h3 className="font-display text-3xl mb-6 flex items-center gap-3">
                    <CheckCircle2 className="text-brand-teal" size={32} />
                    What We Buy
                 </h3>
                 <p className="mb-6 font-medium text-gray-700">
                    We are always looking for clean, well-cared-for LPs and 45s in these genres:
                 </p>
                 <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2">
                     {['Classic Rock', 'Jazz / Blue Note', 'Soul & Funk', 'Hip Hop (90s-Present)', 'Punk / Metal', 'Indie / Alt', 'Reggae / Dub', 'Psych / Prog'].map(genre => (
                         <li key={genre} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-600">
                             <div className="w-1.5 h-1.5 bg-brand-black rounded-full"></div> {genre}
                         </li>
                     ))}
                 </ul>
             </div>

             <div className={`p-8 md:p-12 border-2 ${isRetro ? 'border-brand-black bg-white shadow-retro' : 'border-gray-200 rounded-2xl bg-white'}`}>
                 <h3 className="font-display text-3xl mb-6 flex items-center gap-3">
                    <XCircle className="text-brand-red" size={32} />
                    What We Don't Buy
                 </h3>
                 <p className="mb-6 font-medium text-gray-700">
                    Condition is key. We generally pass on:
                 </p>
                 <ul className="space-y-4">
                     <li className="flex items-start gap-3">
                        <AlertCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-gray-600 text-sm">Records with deep scratches or mold/water damage.</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <AlertCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-gray-600 text-sm">78s (Shellac records) or Laserdiscs.</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <AlertCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-gray-600 text-sm">Common "Thrift Store" titles (e.g., Easy Listening, Big Band, Show Tunes).</span>
                     </li>
                 </ul>
             </div>
         </div>

         {/* Large Collection CTA */}
         <div className="max-w-4xl mx-auto mb-24">
            <div className={`p-8 md:p-12 border-2 relative overflow-hidden
              ${isRetro ? 'bg-brand-black border-brand-black text-brand-cream shadow-retro' : 'bg-black text-white rounded-2xl'}
            `}>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-3 text-white">Have a big collection?</h2>
                  <p className="text-lg text-gray-300 max-w-2xl">
                    Just reach out first. Tell us roughly how many items, what genres, and the overall condition—photos help.
                  </p>
                  {showContactTip && (
                    <p className="mt-4 text-sm text-gray-300/90 font-medium">
                      Tip: include your name, phone number, approximate count, and a couple photos. We’ll reply as soon as we can.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant={isRetro ? 'primary' : 'primary'}
                    size="lg"
                    onClick={() => onNavigate('contact')}
                  >
                    Contact Us
                  </Button>
                  <Button
                    variant={isRetro ? 'outline' : 'outline'}
                    size="lg"
                    onClick={() => setShowContactTip(v => !v)}
                  >
                    What to include
                  </Button>
                </div>
              </div>
            </div>
         </div>

      </Section>
    </div>
  );
};
