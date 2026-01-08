
import React from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ viewMode, onNavigate }) => {
  const isRetro = viewMode === 'retro';

  const toc = [
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'use-of-service', label: 'Use of Service' },
    { id: 'user-accounts', label: 'User Accounts' },
    { id: 'products-pricing', label: 'Products & Pricing' },
    { id: 'orders-payment', label: 'Orders & Payment' },
    { id: 'returns-refunds', label: 'Returns & Refunds' },
    { id: 'intellectual-property', label: 'Intellectual Property' },
    { id: 'limitation-liability', label: 'Limitation of Liability' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'changes', label: 'Changes to Terms' },
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
              Terms of Service
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
              <section id="acceptance" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Acceptance of Terms
                </h2>
                <p className="text-gray-700">
                  By accessing and using Spiral Groove Records, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section id="use-of-service" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Use of Service
                </h2>
                <p className="mb-4 text-gray-700">
                  You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any harmful, offensive, or illegal content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Use automated systems to access the service without permission</li>
                </ul>
              </section>

              <section id="user-accounts" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  User Accounts
                </h2>
                <p className="mb-4 text-gray-700">
                  When you create an account, you are responsible for:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and current information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                </p>
              </section>

              <section id="products-pricing" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Products & Pricing
                </h2>
                <p className="mb-4 text-gray-700">
                  We strive to provide accurate product descriptions, images, and pricing. However:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Product availability is subject to change</li>
                  <li>Prices are subject to change without notice</li>
                  <li>We reserve the right to correct pricing errors</li>
                  <li>Product images are for illustrative purposes and may vary</li>
                  <li>We are not responsible for typographical errors</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  If a product is mispriced, we may cancel your order and notify you of the cancellation.
                </p>
              </section>

              <section id="orders-payment" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Orders & Payment
                </h2>
                <p className="mb-4 text-gray-700">
                  When you place an order:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>You agree to provide accurate payment and shipping information</li>
                  <li>You authorize us to charge your payment method for the order total</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Order confirmation does not guarantee acceptance</li>
                  <li>We may require additional verification for certain orders</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  Payment is processed securely through our payment providers. All prices are in USD unless otherwise stated.
                </p>
              </section>

              <section id="returns-refunds" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Returns & Refunds
                </h2>
                <p className="mb-4 text-gray-700">
                  Our return and refund policy is detailed in our Returns Policy. Key points:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>Returns must be initiated within 30 days of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>Refunds will be processed to the original payment method</li>
                  <li>Shipping costs may be non-refundable</li>
                  <li>Some items may be non-returnable (final sale, personalized items)</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  Please refer to our Returns Policy for complete details and instructions.
                </p>
              </section>

              <section id="intellectual-property" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Intellectual Property
                </h2>
                <p className="mb-4 text-gray-700">
                  All content on this website, including text, graphics, logos, images, and software, is the property of Spiral Groove Records or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-gray-700">
                  You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.
                </p>
              </section>

              <section id="limitation-liability" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Limitation of Liability
                </h2>
                <p className="mb-4 text-gray-700">
                  To the maximum extent permitted by law:
                </p>
                <ul className="ml-6 list-disc space-y-2 text-gray-700">
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount you paid for the products</li>
                  <li>We are not responsible for delays or failures beyond our control</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                </ul>
                <p className="mt-4 text-gray-700">
                  Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above may not apply to you.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Governing Law
                </h2>
                <p className="text-gray-700">
                  These Terms of Service are governed by and construed in accordance with the laws of the State of Ohio, United States, without regard to its conflict of law provisions.
                </p>
              </section>

              <section id="changes" className="scroll-mt-8">
                <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                  Changes to Terms
                </h2>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by posting the updated terms on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

