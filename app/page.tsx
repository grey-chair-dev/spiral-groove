"use client";
import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubmitted(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden w-full">
      {/* Abstract Gradient Shape Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full">
          {/* Abstract gradient blob shape */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-80 gradient-blob-primary"
          />
          {/* Additional smaller blobs for depth */}
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-60 gradient-blob-secondary"
          />
          <div 
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-50 gradient-blob-tertiary"
          />
        </div>
      </div>

      {/* Grid Layout - 50/50 Split */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Half - Text Content */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:pl-64 lg:pr-4 xl:pl-80 2xl:pl-96">
          <div className="space-y-8">
            {/* Coming Soon Badge */}
            <div className="text-text-secondary uppercase text-xs md:text-sm tracking-wider">
              NEW WEBSITE COMING SOON
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-text-primary text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight">
                LOCAL COMMERCE
              </h1>
              <h1 className="text-text-primary text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight">
                TEMPLATE
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="text-text-secondary text-lg md:text-xl max-w-lg font-light">
              Milford&rsquo;s favorite product shop. We&rsquo;re building something special online, but you can always visit us in person.
            </p>

            {/* Visit Us Section */}
            <div className="space-y-4 text-center glass-panel max-w-md mx-auto p-6">
              <h2 className="text-text-primary text-xl md:text-2xl font-semibold uppercase tracking-wider">
                Visit Us
              </h2>
              <div className="text-text-secondary space-y-1">
                <p className="text-lg">215B Main St</p>
                <p className="text-lg">Milford, OH 45150</p>
                <a 
                  href="tel:+15136008018" 
                  className="text-secondary hover:text-primary transition-colors text-lg block mt-2"
                >
                  (513) 600-8018
                </a>
                <p className="text-sm mt-2 italic text-text-muted">Open 12–9 PM daily</p>
              </div>
            </div>

            {/* CTA Button with gradient */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setError(null);
                  }}
                  placeholder="First name"
                  required
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-border-strong transition-colors rounded-lg disabled:opacity-50"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Last name"
                  required
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-border-strong transition-colors rounded-lg disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Your email"
                  required
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-border-strong transition-colors rounded-lg disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || submitted}
                  className="px-8 py-4 bg-neon-gradient text-text-primary font-semibold hover:opacity-90 transition-opacity rounded-lg uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : submitted ? "✓ You're In" : "Notify Me"}
                </button>
              </div>
            </form>
            {submitted && (
              <p className="text-secondary text-sm">Thanks! We&rsquo;ll let you know when the site is live.</p>
            )}
            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            {/* Privacy Policy Link */}
            <div className="pt-4">
              <a
                href="/privacy"
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                Privacy Policy
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-6 pt-4">
              <a
                href="https://www.facebook.com/localcommercetemplate/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-secondary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/localcommerceshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-secondary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.tiktok.com/@localcommerceshop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-secondary transition-colors"
                aria-label="Follow us on TikTok"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Right Half - Spinning Product */}
        <div className="flex items-center justify-center p-8 md:p-12 lg:p-16">
          <div className="relative w-full max-w-lg aspect-square">
            <Image
              src="/logo.png"
              alt="Local Commerce Template"
              fill
              className="object-contain animate-spin-slow"
              style={{ animationDuration: '8s' }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

