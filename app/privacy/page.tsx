import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Local Commerce Template',
  description: 'Privacy policy for Local Commerce Template website.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed">
        <h1 className="text-4xl md:text-5xl font-bold uppercase">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Information We Collect</h2>
            <p>
              When you sign up for our newsletter, we collect:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>First name (optional)</li>
              <li>Last name (optional)</li>
              <li>Email address (required)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">How We Use Your Information</h2>
            <p>
              We use the information you provide to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Send you updates about our new website launch</li>
              <li>Notify you about store events and special offers</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Data Storage</h2>
            <p>
              Your information is securely stored in our database (Neon PostgreSQL) and may be sent to our email marketing service (Make.com) for processing. We do not sell or share your personal information with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Encrypted database connections (SSL/TLS)</li>
              <li>Secure server infrastructure</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Input validation and sanitization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from our newsletter at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Contact Us</h2>
            <p>
              If you have questions about this privacy policy or wish to exercise your rights, please contact us:
            </p>
            <p className="mt-4">
              <strong>Local Commerce Template</strong><br />
              215B Main St<br />
              Milford, OH 45150<br />
              Phone: <a href="tel:+15136008018" className="text-secondary hover:text-primary transition-colors">(513) 600-8018</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-secondary">Updates to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. The last updated date will be indicated at the bottom of this page.
            </p>
          </section>

          <p className="text-sm text-text-muted mt-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

