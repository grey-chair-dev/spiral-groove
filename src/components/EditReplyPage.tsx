import React, { useEffect, useState } from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';
import { fetchGoogleReviewsFlag } from '../lib/featureFlags';

interface EditReplyPageProps {
  viewMode: ViewMode;
}

/**
 * Google review reply form (Make "Review Reply" cutover).
 * Shown when Vercel flag `googleReviews` is on; otherwise retired stub.
 */
export const EditReplyPage: React.FC<EditReplyPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';
  const [flagOn, setFlagOn] = useState<boolean | null>(null);
  const [reviewId, setReviewId] = useState('');
  const [response, setResponse] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'posting' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      const on = await fetchGoogleReviewsFlag();
      if (cancelled) return;
      setFlagOn(on);
      const params = new URLSearchParams(window.location.search);
      const id = params.get('reviewId') || '';
      const reply = params.get('response') || '';
      const tok = params.get('token') || '';
      setReviewId(id);
      setResponse(reply);
      setToken(tok);
      if (on && id && reply && params.get('autoPost') === '1') {
        // Fire-and-forget post from email "Post this reply" link
        setStatus('posting');
        try {
          const res = await fetch('/api/google-reviews/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId: id, response: reply, token: tok || undefined }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) {
            setStatus('error');
            setError(data.error || `HTTP ${res.status}`);
          } else {
            setStatus('ok');
          }
        } catch (e) {
          setStatus('error');
          setError(e instanceof Error ? e.message : 'Request failed');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewId.trim() || !response.trim()) {
      setError('Missing review or reply text');
      setStatus('error');
      return;
    }
    setStatus('posting');
    setError('');
    try {
      const res = await fetch('/api/google-reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: reviewId.trim(),
          response: response.trim(),
          token: token || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setStatus('error');
        setError(data.error || `HTTP ${res.status}`);
        return;
      }
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  const headingClass = `font-display text-3xl md:text-4xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`;

  if (flagOn === null) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className="max-w-xl mx-auto">
            <p className="text-brand-black/80">Loading…</p>
          </div>
        </Section>
      </div>
    );
  }

  if (!flagOn) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className="max-w-xl mx-auto">
            <h1 className={headingClass}>Review replies retired</h1>
            <p className="text-brand-black/80">
              Automated Google review replies are not enabled right now. Post replies from the Google
              Business Profile dashboard instead.
            </p>
          </div>
        </Section>
      </div>
    );
  }

  if (!reviewId) {
    return (
      <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
        <Section>
          <div className="max-w-xl mx-auto">
            <h1 className={headingClass}>Invalid link</h1>
            <p className="text-brand-black/80">
              This page needs a review link from the owner email. Open it from that email to edit or
              post a reply.
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
          <h1 className={headingClass}>Edit reply</h1>
          <p className="text-brand-black/80 mb-6">
            Change the reply below, then submit. We&apos;ll post it to the Google review.
          </p>

          {status === 'ok' ? (
            <p className="text-green-800 bg-green-50 border border-green-200 rounded-md p-4">
              Reply posted to Google.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="response" className="block font-semibold mb-2">
                  Your reply
                </label>
                <textarea
                  id="response"
                  name="response"
                  required
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full min-h-[140px] p-3 border border-brand-black/20 rounded-md bg-white text-brand-black"
                  placeholder="Type or paste your reply…"
                />
              </div>
              {status === 'error' && error ? (
                <p className="text-red-700 text-sm" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === 'posting'}
                className="inline-block px-6 py-3 bg-brand-black text-white rounded-md font-medium disabled:opacity-60"
              >
                {status === 'posting' ? 'Posting…' : 'Submit reply'}
              </button>
            </form>
          )}
        </div>
      </Section>
    </div>
  );
};
