
import React from 'react';
import { ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { ArrowLeft, Eye, MousePointer, Volume2, Keyboard } from 'lucide-react';

interface AccessibilityPageProps {
  viewMode: ViewMode;
  onNavigate: (page: Page) => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ viewMode, onNavigate }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 transition-colors
              ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
            `}
          >
            <ArrowLeft size={14} strokeWidth={3} /> Back to Home
          </button>

          <div className="mb-12">
            <h1 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
              Accessibility Statement
            </h1>
            <p className="text-lg text-gray-600">
              Spiral Groove Records is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className={`mb-4 text-2xl font-bold flex items-center gap-3 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                <Keyboard size={24} />
                Keyboard Navigation
              </h2>
              <p className="text-gray-700 mb-4">
                Our website is fully navigable using only a keyboard. You can:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>Use <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Tab</kbd> to move between interactive elements</li>
                <li>Use <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Enter</kbd> or <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Space</kbd> to activate buttons and links</li>
                <li>Use arrow keys to navigate menus and dropdowns</li>
                <li>Use <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Esc</kbd> to close modals and menus</li>
              </ul>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold flex items-center gap-3 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                <Eye size={24} />
                Visual Accessibility
              </h2>
              <p className="text-gray-700 mb-4">
                We strive to make our content accessible to users with visual impairments:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>All images include descriptive alt text</li>
                <li>Text maintains sufficient contrast ratios (WCAG AA standards)</li>
                <li>Content is structured with proper heading hierarchy</li>
                <li>Text can be resized up to 200% without loss of functionality</li>
                <li>Color is not the only means of conveying information</li>
              </ul>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold flex items-center gap-3 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                <MousePointer size={24} />
                Screen Reader Support
              </h2>
              <p className="text-gray-700 mb-4">
                Our website is compatible with screen readers including:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>NVDA (Windows)</li>
                <li>JAWS (Windows)</li>
                <li>VoiceOver (macOS and iOS)</li>
                <li>TalkBack (Android)</li>
              </ul>
              <p className="mt-4 text-gray-700">
                All interactive elements have proper ARIA labels and roles where needed.
              </p>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold flex items-center gap-3 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                <Volume2 size={24} />
                Audio & Media
              </h2>
              <p className="text-gray-700 mb-4">
                For audio and video content:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>Videos include captions where applicable</li>
                <li>Audio content has transcripts available</li>
                <li>Media players are keyboard accessible</li>
              </ul>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Standards Compliance
              </h2>
              <p className="text-gray-700 mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our website:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>Follows semantic HTML structure</li>
                <li>Provides alternative text for images</li>
                <li>Ensures keyboard accessibility</li>
                <li>Maintains proper focus indicators</li>
                <li>Uses ARIA attributes where appropriate</li>
              </ul>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Known Issues & Improvements
              </h2>
              <p className="text-gray-700 mb-4">
                We are aware that some parts of our website may not be fully accessible. We are working to address these issues:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-gray-700">
                <li>Ongoing improvements to form validation and error messaging</li>
                <li>Enhanced focus indicators for better visibility</li>
                <li>Continued testing with assistive technologies</li>
              </ul>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Feedback & Contact
              </h2>
              <p className="text-gray-700 mb-4">
                We welcome your feedback on the accessibility of Spiral Groove Records. If you encounter accessibility barriers, please let us know:
              </p>
              <div className={`rounded-xl border p-6
                ${isRetro ? 'bg-brand-cream border-2 border-brand-black shadow-retro-sm' : 'bg-gray-50 border-gray-200'}
              `}>
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:accessibility@spiralgrooverecords.com" className="text-brand-orange hover:underline">
                    accessibility@spiralgrooverecords.com
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
              <p className="mt-4 text-gray-700">
                We aim to respond to accessibility feedback within 2 business days.
              </p>
            </section>

            <section>
              <h2 className={`mb-4 text-2xl font-bold ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                Last Updated
              </h2>
              <p className="text-gray-700">
                This accessibility statement was last updated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}.
              </p>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
};

