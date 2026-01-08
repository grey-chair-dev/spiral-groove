
import React from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ viewMode, onNavigate }) => {
  const isRetro = viewMode === 'retro';

  const toc = [
    { id: 'data-collected', label: 'Data Collected' },
    { id: 'how-we-use', label: 'How We Use Your Data' },
    { id: 'data-sharing', label: 'Data Sharing' },
    { id: 'data-security', label: 'Data Security' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'changes', label: 'Policy Changes' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 transition-colors
              ${isRetro ? 'text-white hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
            `}
          >
            <ArrowLeft size={14} strokeWidth={3} /> Back to Home
          </button>

          <div className="mb-8">
            <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-white' : 'text-gray-900'}`}>
              Privacy Policy
            </h1>
            <p className={`text-sm ${isRetro ? 'text-white/50' : 'text-gray-500'}`}>
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Mobile Table of Contents */}
          <div className={`mb-8 rounded-xl border p-4 lg:hidden
            ${isRetro ? 'bg-white border-2 border-brand-black shadow-retro-sm' : 'bg-gray-50 border-gray-200'}
          `}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">Table of Contents</h2>
            <nav className="space-y-2">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left text-xs transition-colors
                    ${isRetro ? 'text-gray-600 hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Desktop Table of Contents Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className={`sticky top-8 rounded-xl border p-6
                ${isRetro ? 'bg-white border-2 border-brand-black shadow-retro-sm' : 'bg-gray-50 border-gray-200'}
              `}>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">Table of Contents</h2>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left text-xs transition-colors
                        ${isRetro ? 'text-gray-600 hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
              <section id="data-collected" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Data Collected
                </h2>
                <p className="mb-4 text-gray-700">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Name, email address, and phone number when you create an account or place an order</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  We also automatically collect certain information when you visit our site, such as your IP address, browser type, device information, and usage patterns.
                </p>
              </section>

              <section id="how-we-use" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  How We Use Your Data
                </h2>
                <p className="mb-4 text-gray-700">We use the information we collect to:</p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and shipping updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Improve our website and services</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section id="data-sharing" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Data Sharing
                </h2>
                <p className="mb-4 text-gray-700">
                  We do not sell your personal information. We may share your data with:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, shipping carriers, email service providers)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  All third parties are contractually obligated to protect your information and use it only for the purposes we specify.
                </p>
              </section>

              <section id="data-security" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Data Security
                </h2>
                <p className="mb-4 text-gray-700">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure storage of sensitive information</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </section>

              <section id="your-rights" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Your Rights
                </h2>
                <p className="mb-4 text-gray-700">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                  <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section id="cookies" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Cookies & Tracking
                </h2>
                <p className="mb-4 text-gray-700">
                  We use cookies and similar tracking technologies to enhance your experience, analyze site usage, and assist with marketing efforts. You can control cookies through your browser settings, though this may affect site functionality.
                </p>
                <p className="text-gray-700">Types of cookies we use:</p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li><strong>Essential:</strong> Required for the site to function properly</li>
                  <li><strong>Analytics:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Marketing:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section id="changes" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Policy Changes
                </h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section id="contact" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Contact Us
                </h2>
                <p className="mb-4 text-gray-700">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                </p>
                <div className={`rounded-xl border p-6
                  ${isRetro ? 'bg-brand-cream border-2 border-brand-black shadow-retro-sm' : 'bg-gray-50 border-gray-200'}
                `}>
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:info@spiralgrooverecords.com" className="text-brand-orange hover:underline">
                      info@spiralgrooverecords.com
                    </a>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+15135551234" className="text-brand-orange hover:underline">
                      (513) 555-1234
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> 215B Main Street, Milford, OH 45150
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

