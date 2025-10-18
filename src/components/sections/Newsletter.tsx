'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getFeatureFlag } from '@/lib/feature-flags';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  showFullContent?: boolean;
  className?: string;
}

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  interests: z.array(z.string()).optional()
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function Newsletter({
  title = 'Stay in the Groove',
  subtitle = 'Get updates on new arrivals, exclusive events, and special offers delivered to your inbox',
  showFullContent = false,
  className
}: NewsletterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Successfully subscribed!');
        reset();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNewsletterEnabled = getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE');

  if (!isNewsletterEnabled) {
    return (
      <section className={`py-16 bg-accent-teal/5 ${className || ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-gray mb-8">
            {subtitle}
          </p>
          <div className="bg-primary-cream/50 border border-accent-teal/20 rounded-large p-6">
            <p className="text-neutral-gray">
              Newsletter signup is currently being set up. Please contact us directly at{' '}
              <a href="mailto:info@spiralgrooverecords.com" className="text-accent-teal hover:text-accent-amber transition-colors">
                info@spiralgrooverecords.com
              </a>{' '}
              to stay updated.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-accent-teal/5 ${className || ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-gray">
            {subtitle}
          </p>
        </div>

        <div className="bg-primary-cream rounded-large p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First Name (Optional)"
                placeholder="Enter your first name"
                error={errors.firstName?.message}
              />
              
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                error={errors.email?.message}
                required
              />
            </div>

            {showFullContent && (
              <div>
                <label className="block text-sm font-medium text-primary-black mb-3">
                  What are you interested in? (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'new-arrivals', label: 'New Arrivals' },
                    { value: 'events', label: 'Events' },
                    { value: 'sales', label: 'Sales & Promotions' },
                    { value: 'vinyl-tips', label: 'Vinyl Tips' },
                    { value: 'local-music', label: 'Local Music' }
                  ].map((interest) => (
                    <label key={interest.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={interest.value}
                        {...register('interests')}
                        className="w-4 h-4 text-accent-teal border-neutral-gray/30 rounded focus:ring-accent-teal focus:ring-2"
                      />
                      <span className="text-sm text-primary-black">{interest.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Subscribing...' : 'Join Newsletter'}
              </Button>
            </div>

            {/* Status message */}
            {submitStatus !== 'idle' && (
              <div className={`text-center p-4 rounded-medium ${
                submitStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}

            {/* Privacy notice */}
            <p className="text-xs text-neutral-gray text-center">
              By subscribing, you agree to receive emails from Spiral Groove Records. 
              You can unsubscribe at any time. We respect your privacy and will never share your information.
            </p>
          </form>
        </div>

        {showFullContent && (
          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl">📧</div>
              <h3 className="font-semibold text-primary-black">Weekly Updates</h3>
              <p className="text-sm text-neutral-gray">
                Get the latest on new arrivals and store events
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎵</div>
              <h3 className="font-semibold text-primary-black">Exclusive Content</h3>
              <p className="text-sm text-neutral-gray">
                Staff picks, vinyl tips, and behind-the-scenes content
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">💰</div>
              <h3 className="font-semibold text-primary-black">Special Offers</h3>
              <p className="text-sm text-neutral-gray">
                Member-only discounts and early access to sales
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
