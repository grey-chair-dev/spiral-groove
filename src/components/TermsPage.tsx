import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface TermsPageProps {
  viewMode: ViewMode;
}

export const TermsPage: React.FC<TermsPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
              Terms of Service
            </h1>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none space-y-8 ${isRetro ? 'prose-brand-black' : ''}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing and using Spiral Groove Records, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Use of Service
              </h2>
              <p className="text-gray-700 mb-4">
                You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Products & Pricing
              </h2>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate product descriptions, images, and pricing. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Product availability is subject to change</li>
                <li>Prices are subject to change without notice</li>
                <li>We reserve the right to correct pricing errors</li>
                <li>Product images are for illustrative purposes and may vary</li>
                <li>We are not responsible for typographical errors</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Orders & Payment
              </h2>
              <p className="text-gray-700 mb-4">
                When you place an order:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You agree to provide accurate payment and shipping information</li>
                <li>You authorize us to charge your payment method for the order total</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Order confirmation does not guarantee acceptance</li>
                <li>We may require additional verification for certain orders</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Payment is processed securely through Square. All prices are in USD unless otherwise stated.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Returns & Refunds
              </h2>
              <p className="text-gray-700 mb-4">
                Our return and refund policy:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Returns must be initiated within 30 days of purchase</li>
                <li>Items must be unused and in original packaging</li>
                <li>Refunds will be processed to the original payment method</li>
                <li>Some items may be non-returnable (final sale, personalized items)</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Limitation of Liability
              </h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid for the products.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Contact Us
              </h2>
              <p className="text-gray-700">
                If you have questions about these Terms of Service, please contact us at <a href="mailto:info@spiralgrooverecords.com" className="text-brand-orange hover:underline">info@spiralgrooverecords.com</a> or visit us at 215B Main Street, Milford, OH 45150.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
};
