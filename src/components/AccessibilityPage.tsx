import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface AccessibilityPageProps {
  viewMode: ViewMode;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
              Accessibility Statement
            </h1>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none space-y-8 ${isRetro ? 'prose-brand-black' : ''}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Our Commitment
              </h2>
              <p className="text-gray-700">
                Spiral Groove Records is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Standards
              </h2>
              <p className="text-gray-700 mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. This means our site strives to be:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Perceivable - Information and user interface components must be presentable to users in ways they can perceive</li>
                <li>Operable - User interface components and navigation must be operable</li>
                <li>Understandable - Information and the operation of user interface must be understandable</li>
                <li>Robust - Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Features
              </h2>
              <p className="text-gray-700 mb-4">
                Our website includes the following accessibility features:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keyboard navigation support</li>
                <li>Alt text for images</li>
                <li>Semantic HTML structure</li>
                <li>Sufficient color contrast</li>
                <li>Responsive design for various screen sizes</li>
                <li>Clear focus indicators</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Feedback
              </h2>
              <p className="text-gray-700">
                We welcome your feedback on the accessibility of Spiral Groove Records. If you encounter accessibility barriers, please contact us at <a href="mailto:info@spiralgrooverecords.com" className="text-brand-orange hover:underline">info@spiralgrooverecords.com</a> or call us at (513) 555-0123. We will make every effort to address your concerns.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Physical Accessibility
              </h2>
              <p className="text-gray-700">
                Our physical store at 215B Main Street, Milford, OH 45150 is wheelchair accessible. If you need assistance during your visit, please contact us in advance and we will be happy to accommodate your needs.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
};
