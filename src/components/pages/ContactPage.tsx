'use client';

import { useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SITE_CONFIG } from '@/lib/constants';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  phone: z.string().max(20).optional(),
  inquiry_type: z.enum(['general', 'product', 'event', 'partnership', 'other']).optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for your message! We\'ll get back to you within 24 hours.');
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

  const inquiryTypes = [
    { value: 'general', label: 'General Question' },
    { value: 'product', label: 'Product Inquiry' },
    { value: 'event', label: 'Event Space' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-primary-cream">
      {/* Hero Section */}
      <SectionWrapper background="secondary" padding="xxl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-cream mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-primary-cream/80 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Get in touch with questions, suggestions, 
            or just to say hello.
          </p>
        </div>
      </SectionWrapper>

      {/* Contact Information */}
      <SectionWrapper background="primary" padding="lg">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-display font-bold text-primary-black mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-teal/10 rounded-large flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">Address</h3>
                    <p className="text-neutral-gray">
                      {SITE_CONFIG.address.full}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-teal/10 rounded-large flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">Phone</h3>
                    <p className="text-neutral-gray">
                      <a href={`tel:${SITE_CONFIG.contact.phone}`} className="hover:text-accent-teal transition-colors">
                        {SITE_CONFIG.contact.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-teal/10 rounded-large flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">Email</h3>
                    <p className="text-neutral-gray">
                      <a href={`mailto:${SITE_CONFIG.contact.email}`} className="hover:text-accent-teal transition-colors">
                        {SITE_CONFIG.contact.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div className="mt-8">
                <h3 className="font-semibold text-primary-black mb-4">Store Hours</h3>
                <div className="space-y-2 text-sm text-neutral-gray">
                  <div className="flex justify-between">
                    <span>Monday - Thursday</span>
                    <span>{SITE_CONFIG.contact.hours.monday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday - Saturday</span>
                    <span>{SITE_CONFIG.contact.hours.friday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>{SITE_CONFIG.contact.hours.sunday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="bg-primary-cream border-accent-teal/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-semibold text-primary-black mb-6">
                    Send us a Message
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        {...register('name')}
                        label="Full Name"
                        placeholder="Enter your full name"
                        error={errors.name?.message}
                        required
                      />
                      
                      <Input
                        {...register('email')}
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        error={errors.email?.message}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        {...register('phone')}
                        label="Phone Number (Optional)"
                        placeholder="Enter your phone number"
                        error={errors.phone?.message}
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-primary-black mb-2">
                          Inquiry Type
                        </label>
                        <select
                          {...register('inquiry_type')}
                          className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                        >
                          {inquiryTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.inquiry_type && (
                          <p className="text-accent-red text-sm mt-1">{errors.inquiry_type.message}</p>
                        )}
                      </div>
                    </div>

                    <Input
                      {...register('subject')}
                      label="Subject"
                      placeholder="What's this about?"
                      error={errors.subject?.message}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-primary-black mb-2">
                        Message
                      </label>
                      <textarea
                        {...register('message')}
                        rows={6}
                        className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                        placeholder="Tell us how we can help..."
                      />
                      {errors.message && (
                        <p className="text-accent-red text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>

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
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Map Placeholder */}
      <SectionWrapper background="accent" padding="lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-primary-cream mb-8">
            Find Us
          </h2>
          <div className="bg-primary-cream/10 border border-primary-cream/20 rounded-large p-12">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-primary-cream text-lg mb-4">
              Google Maps integration coming soon
            </p>
            <p className="text-primary-cream/80">
              {SITE_CONFIG.address.full}
            </p>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
