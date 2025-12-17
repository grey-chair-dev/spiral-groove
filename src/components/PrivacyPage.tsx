import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface PrivacyPageProps {
  viewMode: ViewMode;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
              Privacy Policy
            </h1>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none space-y-8 ${isRetro ? 'prose-brand-black' : ''}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Data Collected
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name, email address, and phone number when you create an account or place an order</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through Square)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We also automatically collect certain information when you visit our site, such as your IP address, browser type, device information, and usage patterns.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                How We Use Your Data
              </h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Data Sharing
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, shipping carriers, email service providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Data Security
              </h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption for data transmission, secure storage of sensitive information, regular security assessments, and access controls.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Your Rights
              </h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us at <a href="mailto:info@spiralgrooverecords.com" className="text-brand-orange hover:underline">info@spiralgrooverecords.com</a>.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Contact Us
              </h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@spiralgrooverecords.com" className="text-brand-orange hover:underline">info@spiralgrooverecords.com</a> or visit us at 215B Main Street, Milford, OH 45150.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
};
