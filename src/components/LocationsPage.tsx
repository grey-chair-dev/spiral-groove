
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
                    <h1 className={`font-display text-5xl md:text-6xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Visit Us</h1>
                    <p className="text-xl text-gray-600 font-medium">The mothership. Come say hi, grab a coffee, and dig.</p>
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
                <h2 className={`font-display text-3xl mb-6 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Pickup & Returns</h2>
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
                            <span><strong>Vintage Vinyl:</strong> 48 hours after purchase.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span><strong>New Vinyl:</strong> 30 days — sealed exchange for full value; if opened, 50% value returned.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span><strong>Equipment:</strong> sealed, still in box — $15 restocking fee on return.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>$5 restocking fee on all new returns.</span>
                         </li>
                         <li className="flex items-start gap-2">
                            <span className="font-bold text-brand-black">•</span>
                            <span>Final sale items are clearly marked.</span>
                         </li>
                      </ul>
                   </div>

                </div>
             </div>

             {/* Where we're featured */}
             <div>
                 <h2 className={`font-display text-3xl mb-6 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Where We’re Featured</h2>
                 <p className="text-gray-600 mb-6">Press, spotlights, and official listings.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <a
                         href="https://www.cincinnatimagazine.com/article/the-beat-lives-on-at-spiral-groove-records/"
                         target="_blank"
                         rel="noreferrer"
                         className={`group p-4 border transition-all ${
                             isRetro
                                 ? 'border-brand-black bg-brand-cream hover:bg-brand-mustard/40 shadow-retro hover:shadow-retro-hover'
                                 : 'border-gray-200 rounded-lg hover:shadow-md'
                         }`}
                     >
                         <div className="flex items-center justify-between gap-3 mb-2">
                             <h4 className="font-bold">Cincinnati Magazine</h4>
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${isRetro ? 'text-brand-black/60' : 'text-gray-500'}`}>Read</span>
                         </div>
                         <p className="text-xs text-gray-600">“The Beat Lives on at Spiral Groove Records”</p>
                     </a>

                     <a
                         href="https://discoverclermont.com/things-to-do/shopping/arts-music-books/spiral-groove-records/"
                         target="_blank"
                         rel="noreferrer"
                         className={`group p-4 border transition-all ${
                             isRetro
                                 ? 'border-brand-black bg-brand-cream hover:bg-brand-mustard/40 shadow-retro hover:shadow-retro-hover'
                                 : 'border-gray-200 rounded-lg hover:shadow-md'
                         }`}
                     >
                         <div className="flex items-center justify-between gap-3 mb-2">
                             <h4 className="font-bold">Discover Clermont</h4>
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${isRetro ? 'text-brand-black/60' : 'text-gray-500'}`}>View</span>
                         </div>
                         <p className="text-xs text-gray-600">Official local guide listing and shop overview</p>
                     </a>

                     <a
                         href="https://recordstoreday.com/Store/23354"
                         target="_blank"
                         rel="noreferrer"
                         className={`group p-4 border transition-all sm:col-span-2 ${
                             isRetro
                                 ? 'border-brand-black bg-brand-cream hover:bg-brand-mustard/40 shadow-retro hover:shadow-retro-hover'
                                 : 'border-gray-200 rounded-lg hover:shadow-md'
                         }`}
                     >
                         <div className="flex items-center justify-between gap-3 mb-2">
                             <h4 className="font-bold">Record Store Day</h4>
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${isRetro ? 'text-brand-black/60' : 'text-gray-500'}`}>Open</span>
                         </div>
                         <p className="text-xs text-gray-600">Official store profile (events + details)</p>
                     </a>
                 </div>
             </div>

          </div>
       </Section>
    </div>
  );
};
