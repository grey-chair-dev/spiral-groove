"use client";

import { useState } from "react";
import Image from "next/image";

export default function BookEvent() {
  const [formData, setFormData] = useState({
    eventType: "",
    preferredDate: "",
    preferredTime: "",
    expectedAttendance: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your inquiry! We'll get back to you within 24 hours.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-text-dark mb-6">
            Book Our Event Space
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Host your next event in our intimate basement venue. Perfect for live music, 
            private parties, album releases, and community gatherings.
          </p>
        </div>
      </section>

      <div className="section">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
              Event Inquiry Form
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-text-dark mb-2">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                >
                  <option value="">Select event type</option>
                  <option value="live-music">Live Music Performance</option>
                  <option value="private-party">Private Party</option>
                  <option value="album-release">Album Release Show</option>
                  <option value="community-event">Community Event</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-text-dark mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-text-dark mb-2">
                    Preferred Time *
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                  >
                    <option value="">Select time</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                    <option value="other">Other (specify in message)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="expectedAttendance" className="block text-sm font-medium text-text-dark mb-2">
                  Expected Attendance *
                </label>
                <select
                  id="expectedAttendance"
                  name="expectedAttendance"
                  value={formData.expectedAttendance}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                >
                  <option value="">Select expected attendance</option>
                  <option value="10-20">10-20 people</option>
                  <option value="20-30">20-30 people</option>
                  <option value="30-40">30-40 people</option>
                  <option value="40-50">40-50 people</option>
                  <option value="50+">50+ people</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-text-dark mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-text-dark mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-text-dark mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-2">
                  Additional Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us more about your event, special requirements, or any questions you have..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-accent-teal text-text-dark"
                />
              </div>

              <button type="submit" className="btn w-full">
                Submit Event Inquiry
              </button>
            </form>
          </div>

          {/* Venue Information */}
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
              Venue Details
            </h2>
            
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-lg text-text-dark mb-3">Space Specifications</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Capacity: 30-50 guests</li>
                  <li>• Intimate basement venue</li>
                  <li>• Professional sound system included</li>
                  <li>• Stage lighting available</li>
                  <li>• Vintage vinyl décor</li>
                  <li>• Wheelchair accessible</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg text-text-dark mb-3">Rental Information</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• 4-hour minimum rental</li>
                  <li>• Setup/breakdown time included</li>
                  <li>• Bar service available (additional cost)</li>
                  <li>• Parking available on-site</li>
                  <li>• Security deposit required</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg text-text-dark mb-3">Perfect For</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Live music performances</li>
                  <li>• Album release shows</li>
                  <li>• Private parties</li>
                  <li>• Community events</li>
                  <li>• Corporate gatherings</li>
                  <li>• Intimate celebrations</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg text-text-dark mb-3">Contact Information</h3>
                <div className="space-y-2 text-neutral-600">
                  <p>Email: events@spiralgrooverecords.com</p>
                  <p>Phone: <a href="tel:+15136008018" className="text-text-dark hover:text-accent-amber transition-colors">(513) 600-8018</a></p>
                  <p>Address: 215B Main St, Milford, OH 45150</p>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg text-text-dark mb-4">Venue Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                <Image 
                  src="/images/placeholders/vinyl.jpg" 
                  alt="Event Space Interior at Spiral Groove Records"
                  width={200}
                  height={150}
                  className="rounded-medium shadow-card"
                />
                <Image 
                  src="/images/placeholders/vinyl.jpg" 
                  alt="Stage Area at Spiral Groove Records"
                  width={200}
                  height={150}
                  className="rounded-medium shadow-card"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
