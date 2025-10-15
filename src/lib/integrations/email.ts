/**
 * Email Service Integration
 * Supports Resend and Nodemailer with feature flag checks
 */

import { featureFlags, withFeatureFlag } from '@/lib/feature-flags';

export interface EmailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface EmailService {
  send(message: EmailMessage): Promise<boolean>;
  sendBulk(messages: EmailMessage[]): Promise<boolean[]>;
  validateEmail(email: string): boolean;
}

/**
 * Resend Email Service
 */
class ResendEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.SMTP_FROM || 'noreply@spiralgroove.com';
  }

  async send(message: EmailMessage): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from || this.fromEmail,
          to: Array.isArray(message.to) ? message.to : [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Resend email error:', error);
      return false;
    }
  }

  async sendBulk(messages: EmailMessage[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      messages.map(message => this.send(message))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Nodemailer Email Service
 */
class NodemailerEmailService implements EmailService {
  private transporter: any;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM || 'noreply@spiralgroove.com';
    
    // In a real implementation, this would create a nodemailer transporter
    this.transporter = {
      sendMail: async (options: any) => {
        console.log('📧 Sending email via Nodemailer:', options);
        return { messageId: `nodemailer_${Date.now()}` };
      },
    };
  }

  async send(message: EmailMessage): Promise<boolean> {
    try {
      const result = await this.transporter.sendMail({
        from: message.from || this.fromEmail,
        to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      return !!result.messageId;
    } catch (error) {
      console.error('Nodemailer email error:', error);
      return false;
    }
  }

  async sendBulk(messages: EmailMessage[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      messages.map(message => this.send(message))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Email Service Factory
 */
class EmailServiceFactory {
  static create(): EmailService | null {
    if (!featureFlags.ENABLE_EMAIL_SERVICE) {
      return null;
    }

    const emailService = process.env.EMAIL_SERVICE || 'resend';
    
    switch (emailService) {
      case 'resend':
        if (!process.env.RESEND_API_KEY) {
          console.warn('⚠️ Resend API key not found, email service disabled');
          return null;
        }
        return new ResendEmailService();
      
      case 'nodemailer':
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
          console.warn('⚠️ SMTP configuration not found, email service disabled');
          return null;
        }
        return new NodemailerEmailService();
      
      default:
        console.warn(`⚠️ Unknown email service: ${emailService}`);
        return null;
    }
  }
}

/**
 * Email Service Client
 */
export class EmailClient {
  private service: EmailService | null;

  constructor() {
    this.service = EmailServiceFactory.create();
  }

  /**
   * Send a single email
   */
  async send(message: EmailMessage): Promise<boolean> {
    return withFeatureFlag(
      'ENABLE_EMAIL_SERVICE',
      async () => {
        if (!this.service) {
          throw new Error('Email service is not configured');
        }

        console.log('📧 Sending email:', message.subject);
        return await this.service.send(message);
      },
      () => {
        console.log('⚠️ Email service is disabled');
        return false;
      }
    ) || false;
  }

  /**
   * Send multiple emails
   */
  async sendBulk(messages: EmailMessage[]): Promise<boolean[]> {
    return withFeatureFlag(
      'ENABLE_EMAIL_SERVICE',
      async () => {
        if (!this.service) {
          throw new Error('Email service is not configured');
        }

        console.log(`📧 Sending ${messages.length} emails`);
        return await this.service.sendBulk(messages);
      },
      () => {
        console.log('⚠️ Email service is disabled');
        return messages.map(() => false);
      }
    ) || messages.map(() => false);
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): boolean {
    if (!this.service) {
      return false;
    }

    return this.service.validateEmail(email);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: {
    id: string;
    customerEmail: string;
    customerName: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<boolean> {
    const message: EmailMessage = {
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id}`,
      html: `
        <h2>Thank you for your order, ${order.customerName}!</h2>
        <p>Your order #${order.id} has been confirmed.</p>
        <h3>Order Details:</h3>
        <ul>
          ${order.items.map(item => 
            `<li>${item.name} x${item.quantity} - $${item.price.toFixed(2)}</li>`
          ).join('')}
        </ul>
        <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
        <p>We'll send you a shipping confirmation once your order is on its way.</p>
      `,
    };

    return await this.send(message);
  }

  /**
   * Send event inquiry confirmation
   */
  async sendEventInquiryConfirmation(inquiry: {
    name: string;
    email: string;
    eventTitle: string;
    attendees: number;
  }): Promise<boolean> {
    const message: EmailMessage = {
      to: inquiry.email,
      subject: `Event Inquiry Confirmation - ${inquiry.eventTitle}`,
      html: `
        <h2>Thank you for your interest, ${inquiry.name}!</h2>
        <p>We've received your inquiry about <strong>${inquiry.eventTitle}</strong> for ${inquiry.attendees} attendees.</p>
        <p>Our team will review your request and get back to you within 24 hours.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `,
    };

    return await this.send(message);
  }

  /**
   * Send newsletter subscription confirmation
   */
  async sendNewsletterConfirmation(email: string): Promise<boolean> {
    const message: EmailMessage = {
      to: email,
      subject: 'Welcome to Spiral Groove Records Newsletter!',
      html: `
        <h2>Welcome to our newsletter!</h2>
        <p>Thank you for subscribing to Spiral Groove Records updates.</p>
        <p>You'll receive the latest news about:</p>
        <ul>
          <li>New vinyl arrivals</li>
          <li>Upcoming events</li>
          <li>Special offers and discounts</li>
          <li>Music industry news</li>
        </ul>
        <p>Happy listening!</p>
      `,
    };

    return await this.send(message);
  }
}

// Export singleton instance
export const emailClient = new EmailClient();
