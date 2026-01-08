
import React, { useState } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';

interface FAQPageProps {
  viewMode: ViewMode;
}

const FAQ_ITEMS = [
  {
    category: "General",
    questions: [
      {
        q: "Where is the shop located?",
        a: "We are located at 215B Main Street, Milford, OH, United States, 45150. Look for the orange neon sign."
      },
      {
        q: "What are your hours?",
        a: "Mon-Thu 11am-7pm, Fri-Sat 10am-9pm, and Sun 11am-5pm."
      },
      {
        q: "Are you dog friendly?",
        a: "Absolutely! We keep treats behind the counter. Just make sure they're leashed and don't chew on the rare grooves."
      }
    ]
  },
  {
    category: "Buying & Selling",
    questions: [
      {
        q: "Do you buy used records?",
        a: "Yes! We buy used vinyl, cassettes, and hi-fi gear. Bring them by the shop any day between 12pm-6pm. For collections larger than 500 pieces, please contact us to schedule a house call."
      },
      {
        q: "How do you determine trade-in value?",
        a: "We grade strictly by Goldmine standards. We generally offer 30-50% of retail value in cash, or 50-60% in store credit. Condition is everything."
      },
      {
        q: "Do you buy CDs?",
        a: "We are very selective with CDs. We primarily look for rare jazz, heavy metal, and 90s alternative. Common titles are generally passed on."
      }
    ]
  },
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within the continental United States. We hope to expand to Canada and the UK soon."
      },
      {
        q: "Can I order online and pick up in-store?",
        a: "Yes! Select 'Local Pickup' at checkout. We usually have orders ready within 2 hours. We'll hold them for up to 7 days."
      },
      {
        q: "What is your return policy?",
        a: "Used items are backed by a 14-day defect guarantee. New, sealed items can be returned within 30 days if unopened. Clearance items are final sale."
      }
    ]
  }
];

export const FAQPage: React.FC<FAQPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFAQs = FAQ_ITEMS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
       <Section>
          <div className="max-w-3xl mx-auto">
             
             {/* Header */}
             <div className="text-center mb-12">
                <span className={`inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest rounded-sm transform -rotate-2
                   ${isRetro ? 'bg-brand-orange text-brand-black shadow-pop-sm' : 'bg-orange-100 text-orange-800'}
                `}>
                   Help Center
                </span>
               <h1 className={`font-display text-4xl md:text-6xl mb-4 ${isRetro ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h1>
                <p className="text-lg text-gray-500 max-w-xl mx-auto">
                    Everything you need to know about digging, trading, and spinning with us.
                </p>
             </div>

             {/* Search */}
             <div className="mb-16 relative max-w-xl mx-auto">
                <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                <input 
                   type="text" 
                   placeholder="Search questions..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className={`w-full pl-12 pr-4 py-4 font-medium focus:outline-none transition-all
                      ${isRetro 
                         ? 'bg-white border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                         : 'bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                   `}
                />
             </div>

             {/* FAQ Content */}
             <div className="space-y-12">
                {filteredFAQs.length > 0 ? filteredFAQs.map((category) => (
                   <div key={category.category}>
                      <h2 className={`font-display text-2xl mb-6 flex items-center gap-3
                         ${isRetro ? 'text-white' : 'text-gray-800'}
                      `}>
                         <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm border-2
                            ${isRetro ? 'bg-brand-teal border-brand-black text-white' : 'bg-gray-100 border-gray-200 text-gray-500'}
                         `}>
                            {category.category.charAt(0)}
                         </span>
                         {category.category}
                      </h2>
                      
                      <div className="space-y-4">
                         {category.questions.map((item, idx) => {
                            const isOpen = openItems[`${category.category}-${idx}`];
                            return (
                               <div 
                                  key={idx} 
                                  className={`group transition-all duration-300
                                     ${isRetro 
                                        ? 'bg-white border-2 border-brand-black shadow-retro' 
                                        : 'bg-white border border-gray-200 rounded-lg hover:border-gray-300'}
                                  `}
                               >
                                  <button 
                                     onClick={() => toggleItem(category.category, idx)}
                                     className="w-full text-left p-6 flex items-start justify-between gap-4 focus:outline-none"
                                  >
                                     <span className={`font-bold text-lg leading-snug
                                        ${isRetro ? 'font-header' : 'font-sans text-gray-900'}
                                     `}>
                                        {item.q}
                                     </span>
                                     <span className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                        {isOpen 
                                           ? <Minus size={20} className={isRetro ? 'text-brand-orange' : 'text-gray-400'} />
                                           : <Plus size={20} className={isRetro ? 'text-brand-black' : 'text-gray-400'} />
                                        }
                                     </span>
                                  </button>
                                  
                                  <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                     ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                                  `}>
                                     <div className={`px-6 pb-6 text-base leading-relaxed
                                        ${isRetro ? 'text-gray-600 font-medium' : 'text-gray-500'}
                                     `}>
                                        {item.a}
                                     </div>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                )) : (
                   <div className="text-center py-12 opacity-50">
                      <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-bold">No results found.</p>
                      <p>Try searching for "shipping" or "grading".</p>
                   </div>
                )}
             </div>

             {/* Still need help? */}
             <div className={`mt-20 p-8 text-center border-2 border-dashed
                ${isRetro ? 'bg-brand-mustard/20 border-brand-black/20' : 'bg-gray-50 border-gray-200 rounded-xl'}
             `}>
                <h3 className="font-display text-2xl mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-6">We're here to help. Send us an email or drop by the shop.</p>
                <a href="mailto:hello@spiralgroove.com" className={`inline-block px-8 py-3 font-bold uppercase tracking-wider transition-all
                   ${isRetro 
                      ? 'bg-brand-black text-white border-2 border-brand-black shadow-pop-sm hover:-translate-y-0.5' 
                      : 'bg-black text-white rounded-full hover:bg-gray-800'}
                `}>
                   Contact Support
                </a>
             </div>

          </div>
       </Section>
    </div>
  );
};
