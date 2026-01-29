
import React, { useState } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';

interface ContactPageProps {
  viewMode: ViewMode;
}

export const ContactPage: React.FC<ContactPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-6xl mx-auto">
           
           {/* Header */}
           <div className="text-center mb-16">
              <span className={`inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.2em] 
                 ${isRetro 
                    ? 'bg-brand-black text-white border-2 border-brand-black shadow-pop-sm transform rotate-2' 
                    : 'bg-black text-white rounded-full'}
              `}>
                  Get In Touch
              </span>
              <h1 className={`font-display text-5xl md:text-7xl mb-6 leading-tight ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                 Holler At Us.
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                 Questions about an order? Looking for a specific pressing? Just want to talk jazz? We're all ears.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              
              {/* Contact Info Column */}
              <div className="space-y-12">
                 
                 {/* Main Details */}
                 <div className={`p-8 border-2 relative overflow-hidden
                    ${isRetro ? 'bg-brand-mustard border-brand-black shadow-retro' : 'bg-gray-50 border-gray-200 rounded-2xl'}
                 `}>
                    {isRetro && (
                         <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/20 rounded-bl-full pointer-events-none"></div>
                    )}
                    
                    <h3 className="font-display text-3xl mb-8">The Shop</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${isRetro ? 'bg-brand-black text-white' : 'bg-white text-black shadow-sm'}`}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-1 opacity-70">Visit Us</h4>
                                <p className="font-medium text-lg leading-snug">215B Main Street<br/>Milford, OH 45150</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${isRetro ? 'bg-brand-black text-white' : 'bg-white text-black shadow-sm'}`}>
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-1 opacity-70">Call Us</h4>
                                <p className="font-medium text-lg">(513) 555-0199</p>
                                <p className="text-sm opacity-60">Mon-Thu 11am-7pm · Fri-Sat 10am-9pm · Sun 11am-5pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${isRetro ? 'bg-brand-black text-white' : 'bg-white text-black shadow-sm'}`}>
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wider mb-1 opacity-70">Email Us</h4>
                                <p className="font-medium text-lg">hello@spiralgroove.com</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Socials / Extra */}
                 <div className={`p-8 border-2 text-center
                    ${isRetro ? 'bg-brand-teal border-brand-black shadow-retro text-white' : 'bg-black text-white border-black rounded-2xl'}
                 `}>
                    <h3 className="font-display text-2xl mb-4">Buying Records?</h3>
                    <p className="mb-6 opacity-90">
                        We buy used vinyl every day. For large collections, contact us first so we can plan the best time.
                    </p>
                    <div className="flex justify-center">
                        <Button 
                            variant={isRetro ? 'outline' : 'outline'} 
                            className={isRetro ? 'bg-white text-brand-black border-brand-black hover:bg-brand-cream' : 'border-white text-white hover:bg-white hover:text-black'}
                            onClick={() => window.location.href = '/we-buy'} // In a real app use navigation prop
                        >
                            Sell Your Collection
                        </Button>
                    </div>
                 </div>

              </div>

              {/* Form Column */}
              <div>
                 <div className={`p-8 md:p-12 border-2 h-full
                    ${isRetro ? 'bg-white border-brand-black shadow-retro' : 'bg-white border-gray-200 rounded-2xl shadow-sm'}
                 `}>
                    <h3 className="font-display text-3xl mb-6">Send a Message</h3>
                    
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                                ${isRetro ? 'bg-brand-orange border-2 border-brand-black' : 'bg-green-100 text-green-600'}
                            `}>
                                <MessageSquare size={32} />
                            </div>
                            <h4 className="font-display text-3xl mb-2">Received!</h4>
                            <p className="text-gray-500 max-w-xs mx-auto mb-8">
                                Thanks for reaching out. We'll get back to you within 24 hours.
                            </p>
                            <Button onClick={() => setSubmitted(false)} variant="outline">
                                Send Another
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Your Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                                        ${isRetro 
                                        ? 'bg-brand-cream border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                        : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                    `}
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                                        ${isRetro 
                                        ? 'bg-brand-cream border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                        : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                    `}
                                    placeholder="jane@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Topic</label>
                                <div className="relative">
                                    <select 
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        className={`w-full p-4 border-2 font-medium focus:outline-none transition-all appearance-none cursor-pointer
                                            ${isRetro 
                                            ? 'bg-brand-cream border-brand-black focus:shadow-pop-sm' 
                                            : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                        `}
                                    >
                                        <option>General Inquiry</option>
                                        <option>Order Support</option>
                                        <option>Selling Collection</option>
                                        <option>Event Booking</option>
                                        <option>Specific Request</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Message</label>
                                <textarea 
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className={`w-full p-4 border-2 font-medium focus:outline-none transition-all resize-none
                                        ${isRetro 
                                        ? 'bg-brand-cream border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                        : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                    `}
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg" 
                                fullWidth 
                                disabled={isSubmitting}
                                className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : ''}
                            >
                                {isSubmitting ? 'Sending...' : (
                                    <span className="flex items-center gap-2">Send Message <Send size={18} /></span>
                                )}
                            </Button>
                        </form>
                    )}
                 </div>
              </div>

           </div>

        </div>
      </Section>
    </div>
  );
};
