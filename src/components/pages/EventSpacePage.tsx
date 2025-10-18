'use client';

import { useState } from 'react';
import Image from 'next/image';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getFeatureFlag } from '@/lib/feature-flags';

const eventInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required').max(20),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  attendance: z.number().int().min(1, 'Attendance must be at least 1').max(100),
  event_type: z.enum(['concert', 'listening-party', 'workshop', 'meetup', 'other']),
  description: z.string().min(10, 'Please provide more details').max(1000),
  special_requirements: z.string().max(500).optional(),
  budget: z.string().max(50).optional()
});

type EventInquiryFormData = z.infer<typeof eventInquirySchema>;

export default function EventSpacePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EventInquiryFormData>({
    resolver: zodResolver(eventInquirySchema)
  });

  const onSubmit = async (data: EventInquiryFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/event-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for your inquiry! We\'ll get back to you within 24 hours.');
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

  const eventTypes = [
    { value: 'concert', label: 'Concert' },
    { value: 'listening-party', label: 'Listening Party' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'other', label: 'Other' }
  ];

  const isEventInquiriesEnabled = getFeatureFlag('FEATURE_EVENT_INQUIRIES');

  return (
    <div className="min-h-screen bg-primary-cream">
      {/* Hero Section */}
      <SectionWrapper background="secondary" padding="xxl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-cream mb-6">
            Event Space
          </h1>
          <p className="text-xl text-primary-cream/80 max-w-3xl mx-auto leading-relaxed">
            Host your next event in our intimate, music-focused space. Perfect for concerts, 
            listening parties, workshops, and community gatherings.
          </p>
        </div>
      </SectionWrapper>

      {/* Space Details */}
      <SectionWrapper background="primary" padding="lg">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-primary-black mb-6">
                The Perfect Venue
              </h2>
              <p className="text-lg text-neutral-gray mb-6 leading-relaxed">
                Our event space is designed with music lovers in mind. Featuring professional 
                sound equipment, intimate seating, and a warm, welcoming atmosphere that 
                brings people together.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  <span className="text-primary-black">Capacity: 50 people</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  <span className="text-primary-black">Professional sound system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  <span className="text-primary-black">Flexible seating arrangements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  <span className="text-primary-black">Lighting and staging options</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  <span className="text-primary-black">Accessible entrance</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-accent-teal/20 rounded-large flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-primary-black text-lg font-semibold">Event Space Photo</p>
                  <p className="text-primary-black/60 text-sm">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Pricing & Packages */}
      <SectionWrapper background="accent" padding="lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-primary-cream mb-8">
            Pricing & Packages
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="event" className="bg-primary-cream/10 border-primary-cream/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-semibold text-primary-cream mb-2">
                  Basic Package
                </h3>
                <div className="text-3xl font-bold text-accent-amber mb-4">$150</div>
                <ul className="text-primary-cream/80 text-sm space-y-2">
                  <li>• 4-hour rental</li>
                  <li>• Basic sound system</li>
                  <li>• Standard lighting</li>
                  <li>• Up to 30 people</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="event" className="bg-primary-cream/10 border-primary-cream/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-semibold text-primary-cream mb-2">
                  Premium Package
                </h3>
                <div className="text-3xl font-bold text-accent-amber mb-4">$250</div>
                <ul className="text-primary-cream/80 text-sm space-y-2">
                  <li>• 6-hour rental</li>
                  <li>• Professional sound system</li>
                  <li>• Enhanced lighting</li>
                  <li>• Up to 50 people</li>
                  <li>• Staff assistance</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="event" className="bg-primary-cream/10 border-primary-cream/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-semibold text-primary-cream mb-2">
                  Custom Package
                </h3>
                <div className="text-3xl font-bold text-accent-amber mb-4">Contact Us</div>
                <ul className="text-primary-cream/80 text-sm space-y-2">
                  <li>• Extended hours</li>
                  <li>• Custom setup</li>
                  <li>• Catering options</li>
                  <li>• Full service</li>
                  <li>• Special requests</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionWrapper>

      {/* Inquiry Form */}
      <SectionWrapper background="primary" padding="lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
              Book Your Event
            </h2>
            <p className="text-lg text-neutral-gray">
              Ready to host your event? Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          {!isEventInquiriesEnabled ? (
            <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-large p-8 text-center">
              <p className="text-primary-black mb-4">
                Event inquiries are currently being set up. Please contact us directly to book your event.
              </p>
              <Button
                onClick={() => window.location.href = 'mailto:events@spiralgrooverecords.com'}
              >
                Contact Us
              </Button>
            </div>
          ) : (
            <Card className="bg-primary-cream border-accent-teal/20">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      {...register('phone')}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      error={errors.phone?.message}
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-primary-black mb-2">
                        Event Type
                      </label>
                      <select
                        {...register('event_type')}
                        className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      >
                        {eventTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.event_type && (
                        <p className="text-accent-red text-sm mt-1">{errors.event_type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      {...register('event_date')}
                      label="Event Date"
                      type="date"
                      error={errors.event_date?.message}
                      required
                    />
                    
                    <Input
                      {...register('event_time')}
                      label="Event Time"
                      type="time"
                      error={errors.event_time?.message}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      {...register('attendance', { valueAsNumber: true })}
                      label="Expected Attendance"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Number of guests"
                      error={errors.attendance?.message}
                      required
                    />
                    
                    <Input
                      {...register('budget')}
                      label="Budget (Optional)"
                      placeholder="Your budget range"
                      error={errors.budget?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-black mb-2">
                      Event Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      placeholder="Tell us about your event..."
                    />
                    {errors.description && (
                      <p className="text-accent-red text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-black mb-2">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      {...register('special_requirements')}
                      rows={3}
                      className="w-full px-3 py-2 border border-accent-teal/20 rounded-small bg-primary-cream text-primary-black focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      placeholder="Any special needs or requests..."
                    />
                    {errors.special_requirements && (
                      <p className="text-accent-red text-sm mt-1">{errors.special_requirements.message}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
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
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}
