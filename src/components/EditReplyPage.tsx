import React, { useMemo, useEffect } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq';

interface EditReplyPageProps {
  viewMode: ViewMode;
}

export const EditReplyPage: React.FC<EditReplyPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  const { reviewId, response } = useMemo(() => {
    if (typeof window === 'undefined') return { reviewId: '', response: '' };
    const params = new URLSearchParams(window.location.search);
    return {
      reviewId: params.get('reviewId') || '',
      response: params.get('response') || '',
    };
  }, []);

  // Not for indexing; only available via email link
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const validLink = Boolean(reviewId);

  if (!validLink) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className="max-w-xl mx-auto">
            <h1
              className={`font-display text-3xl md:text-4xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}
            >
              Invalid link
            </h1>
            <p className="text-brand-black/80">
              This page is only available from the link in your review notification email. Use the
              Edit button in that email to open the reply form.
            </p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-xl mx-auto">
          <h1
            className={`font-display text-3xl md:text-4xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}
          >
            Edit reply
          </h1>
          <p className="mb-6 text-brand-black/80">
            Change the reply below, then click Submit. We’ll post it to the Google review (we manage
            the business profile).
          </p>
          <form
            method="post"
            action={MAKE_WEBHOOK_URL}
            target="_blank"
            className="space-y-4"
          >
            <input
              type="hidden"
              name="reviewId"
              id="edit-reply-reviewId"
              value={reviewId}
              readOnly
            />
            <label htmlFor="edit-reply-response" className="block font-semibold text-brand-black">
              Your reply
            </label>
            <textarea
              id="edit-reply-response"
              name="response"
              required
              placeholder="Type or paste your reply…"
              className="w-full min-h-[120px] px-3 py-2 border-2 border-brand-black rounded-lg font-sans text-brand-black bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
              defaultValue={response}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-orange text-white font-bold uppercase tracking-wider rounded-lg shadow-pop hover:shadow-pop-hover transition-all"
            >
              Submit reply
            </button>
          </form>
        </div>
      </Section>
    </div>
  );
};
