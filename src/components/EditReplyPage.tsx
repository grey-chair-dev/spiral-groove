import React, { useMemo, useEffect, useState } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/vp5fdupao3oxo5y9p5gkl7a3irl0r7mq';

interface EditReplyPageProps {
  viewMode: ViewMode;
}

export const EditReplyPage: React.FC<EditReplyPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const responseText = (form.elements.namedItem('response') as HTMLTextAreaElement)?.value?.trim();
    if (!responseText) return;
    setSubmitting(true);
    try {
      const body = new URLSearchParams({ reviewId, response: responseText });
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error('Something went wrong.');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (submitted) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className="max-w-xl mx-auto">
            <h1
              className={`font-display text-3xl md:text-4xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}
            >
              Reply submitted
            </h1>
            <p className="text-brand-black/80">
              Your reply has been sent and will be posted to the Google review. Thank you.
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
          {error && (
            <p className="mb-4 text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="reviewId" value={reviewId} readOnly />
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
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-orange text-white font-bold uppercase tracking-wider rounded-lg shadow-pop hover:shadow-pop-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit reply'}
            </button>
          </form>
        </div>
      </Section>
    </div>
  );
};
