import React, { useEffect } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface EditReplyPageProps {
  viewMode: ViewMode;
}

/**
 * Google review reply flow used to POST to a Make.com webhook.
 * That scenario is paused; this page is kept so old email links do not 404.
 */
export const EditReplyPage: React.FC<EditReplyPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-xl mx-auto">
          <h1
            className={`font-display text-3xl md:text-4xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}
          >
            Review replies retired
          </h1>
          <p className="text-brand-black/80">
            Automated Google review replies are no longer available from this site. Post replies from
            the Google Business Profile dashboard instead.
          </p>
        </div>
      </Section>
    </div>
  );
};
