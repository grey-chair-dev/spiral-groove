
import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';
import { MapPin, Clock, Coffee, Beer, Package, RefreshCw } from 'lucide-react';

interface LocationsPageProps {
  viewMode: ViewMode;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500">
       <Section>
          <div className="max-w-4xl mx-auto space-y-12">
             
             {/* Main Location Info */}
             <div>
                <div>
                    <h1 className={`font-display text-5xl md:text-6xl mb-4 ${isRetro ? 'text-white' : 'text-gray-900'}`}>Visit Us</h1>
                    <p className={`text-xl font-medium ${isRetro ? 'text-white/70' : 'text-gray-600'}`}>The mothership. Come say hi, grab a coffee, and dig.</p>
                </div>

                {/* Info Card */}
                <div className={`mt-8 p-8 border-2 ${isRetro ? 'border-brand-black bg-white shadow-retro' : 'border-gray-200 rounded-xl bg-gray-50'}`}>
                    <div className="flex items-start gap-4 mb-6">
                        <MapPin className="text-brand-orange mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Spiral Groove Records</h3>
                            <p className="text-gray-600">215B Main Street</p>
                            <p className="text-gray-600">Milford, OH 45150</p>
                            <a href="https://maps.app.goo.gl/3qbvhV6uKQ1rs2ko7" target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-orange uppercase tracking-wider mt-2 inline-block hover:underline">Open in Maps</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Clock className="text-brand-teal mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Hours</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 font-medium">
                                <span>Mon - Thu</span> <span>11am - 7pm</span>
                                <span>Fri - Sat</span> <span>10am - 9pm</span>
                                <span>Sunday</span> <span>11am - 5pm</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Pickup & Returns Section */}
             <div id="pickup-returns">
                <h2 className={`font-display text-3xl mb-6 ${isRetro ? 'text-white' : 'text-gray-900'}`}>Pickup & Returns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Store Pickup */}
                   <div className={`p-6 border-2 ${isRetro ? 'border-brand-black bg-brand-cream/50' : 'border-gray-200 rounded-xl bg-white'}`}>
                      <div className="flex items-center gap-3 mb-4">
                         <Package className="text-brand-orange" size={24} />
                         <h3 className="font-bold text-lg">In-Store Pickup</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>Orders generally ready within 2 hours.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>Bring your ID and order confirmation #.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>We hold orders for 7 days max.</span>
                         </li>
                      </ul>
                   </div>

                   {/* Returns Policy */}
                   <div className={`p-6 border-2 ${isRetro ? 'border-brand-black bg-brand-cream/50' : 'border-gray-200 rounded-xl bg-white'}`}>
                      <div className="flex items-center gap-3 mb-4">
                         <RefreshCw className="text-brand-teal" size={24} />
                         <h3 className="font-bold text-lg">Returns Policy</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span><strong>Used:</strong> 14-day guarantee for defects.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span><strong>New:</strong> 30 days (must be sealed).</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>Clearance/Sale items are final sale.</span>
                         </li>
                      </ul>
                   </div>

                </div>
             </div>

             {/* Partnerships */}
             <div>
                 <h2 className={`font-display text-3xl mb-6 ${isRetro ? 'text-white' : 'text-gray-900'}`}>Official Listening Stations</h2>
                 <p className={`${isRetro ? 'text-white/70' : 'text-gray-600'} mb-6`}>Find our curated selections at these fine local establishments.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className={`p-4 border ${isRetro ? 'border-brand-black bg-brand-cream' : 'border-gray-200 rounded-lg'}`}>
                         <div className="flex items-center gap-2 mb-2">
                             <Coffee size={18} className="text-brand-black" />
                             <h4 className="font-bold">Bean & Leaf</h4>
                         </div>
                         <p className="text-xs text-gray-600">The best pour-over in Milford. Ask for the Spiral Blend.</p>
                     </div>
                     <div className={`p-4 border ${isRetro ? 'border-brand-black bg-brand-cream' : 'border-gray-200 rounded-lg'}`}>
                         <div className="flex items-center gap-2 mb-2">
                             <Beer size={18} className="text-brand-black" />
                             <h4 className="font-bold">Little Miami Brewing</h4>
                         </div>
                         <p className="text-xs text-gray-600">Sip a hazy IPA while listening to our monthly curated playlist.</p>
                     </div>
                 </div>
             </div>

          </div>
       </Section>
    </div>
  );
};
