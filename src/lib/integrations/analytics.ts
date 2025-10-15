/**
 * Analytics Integration
 * Supports Google Analytics 4 and Mixpanel with feature flag checks
 */

import { featureFlags, withFeatureFlag } from '@/lib/feature-flags';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  properties?: Record<string, any>;
}

export interface AnalyticsPageView {
  path: string;
  title?: string;
  properties?: Record<string, any>;
}

/**
 * Google Analytics 4 Client
 */
class GoogleAnalyticsClient {
  private measurementId: string;
  private apiSecret?: string;

  constructor() {
    this.measurementId = process.env.GOOGLE_ANALYTICS_ID || '';
    this.apiSecret = process.env.GOOGLE_ANALYTICS_SECRET;
  }

  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      const payload = {
        client_id: event.sessionId || 'anonymous',
        user_id: event.userId,
        events: [{
          name: event.name,
          params: {
            ...event.properties,
            timestamp_micros: Date.now() * 1000,
          },
        }],
      };

      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}${this.apiSecret ? `&api_secret=${this.apiSecret}` : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Google Analytics error:', error);
      return false;
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(pageView: AnalyticsPageView): Promise<boolean> {
    return this.trackEvent({
      name: 'page_view',
      properties: {
        page_title: pageView.title,
        page_location: pageView.path,
        ...pageView.properties,
      },
    });
  }

  /**
   * Identify a user
   */
  async identifyUser(user: AnalyticsUser): Promise<boolean> {
    return this.trackEvent({
      name: 'user_engagement',
      userId: user.id,
      properties: {
        user_properties: {
          email: user.email,
          name: user.name,
          ...user.properties,
        },
      },
    });
  }
}

/**
 * Mixpanel Client
 */
class MixpanelClient {
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = process.env.MIXPANEL_TOKEN || '';
    this.baseUrl = 'https://api.mixpanel.com';
  }

  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      const payload = {
        event: event.name,
        properties: {
          token: this.token,
          distinct_id: event.userId || event.sessionId || 'anonymous',
          time: Math.floor(Date.now() / 1000),
          ...event.properties,
        },
      };

      const response = await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Mixpanel error:', error);
      return false;
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(pageView: AnalyticsPageView): Promise<boolean> {
    return this.trackEvent({
      name: 'Page View',
      properties: {
        page: pageView.path,
        title: pageView.title,
        ...pageView.properties,
      },
    });
  }

  /**
   * Identify a user
   */
  async identifyUser(user: AnalyticsUser): Promise<boolean> {
    try {
      const payload = {
        $token: this.token,
        $distinct_id: user.id,
        $set: {
          $email: user.email,
          $name: user.name,
          ...user.properties,
        },
      };

      const response = await fetch(`${this.baseUrl}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Mixpanel identify error:', error);
      return false;
    }
  }
}

/**
 * Analytics Service Factory
 */
class AnalyticsServiceFactory {
  static create(): (GoogleAnalyticsClient | MixpanelClient)[] {
    const services: (GoogleAnalyticsClient | MixpanelClient)[] = [];

    if (featureFlags.ENABLE_ANALYTICS) {
      if (process.env.GOOGLE_ANALYTICS_ID) {
        services.push(new GoogleAnalyticsClient());
      }
      
      if (process.env.MIXPANEL_TOKEN) {
        services.push(new MixpanelClient());
      }
    }

    return services;
  }
}

/**
 * Analytics Client
 */
export class AnalyticsClient {
  private services: (GoogleAnalyticsClient | MixpanelClient)[];

  constructor() {
    this.services = AnalyticsServiceFactory.create();
  }

  /**
   * Track an event across all enabled services
   */
  async trackEvent(event: AnalyticsEvent): Promise<boolean[]> {
    return withFeatureFlag(
      'ENABLE_ANALYTICS',
      async () => {
        if (this.services.length === 0) {
          console.warn('⚠️ No analytics services configured');
          return [];
        }

        console.log('📊 Tracking event:', event.name);
        const results = await Promise.allSettled(
          this.services.map(service => service.trackEvent(event))
        );

        return results.map(result => 
          result.status === 'fulfilled' ? result.value : false
        );
      },
      () => {
        console.log('⚠️ Analytics is disabled');
        return [];
      }
    ) || [];
  }

  /**
   * Track a page view
   */
  async trackPageView(pageView: AnalyticsPageView): Promise<boolean[]> {
    return this.trackEvent({
      name: 'page_view',
      properties: {
        page_title: pageView.title,
        page_location: pageView.path,
        ...pageView.properties,
      },
    });
  }

  /**
   * Identify a user
   */
  async identifyUser(user: AnalyticsUser): Promise<boolean[]> {
    const results = await Promise.allSettled(
      this.services.map(service => service.identifyUser(user))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  /**
   * Track e-commerce events
   */
  async trackPurchase(order: {
    id: string;
    userId?: string;
    sessionId?: string;
    total: number;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>;
  }): Promise<boolean[]> {
    return this.trackEvent({
      name: 'purchase',
      userId: order.userId,
      sessionId: order.sessionId,
      properties: {
        transaction_id: order.id,
        value: order.total,
        currency: 'USD',
        items: order.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  }

  /**
   * Track product view
   */
  async trackProductView(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    userId?: string;
    sessionId?: string;
  }): Promise<boolean[]> {
    return this.trackEvent({
      name: 'view_item',
      userId: product.userId,
      sessionId: product.sessionId,
      properties: {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        currency: 'USD',
      },
    });
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(item: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    userId?: string;
    sessionId?: string;
  }): Promise<boolean[]> {
    return this.trackEvent({
      name: 'add_to_cart',
      userId: item.userId,
      sessionId: item.sessionId,
      properties: {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        currency: 'USD',
      },
    });
  }

  /**
   * Track event inquiry
   */
  async trackEventInquiry(event: {
    id: string;
    title: string;
    attendees: number;
    userId?: string;
    sessionId?: string;
  }): Promise<boolean[]> {
    return this.trackEvent({
      name: 'event_inquiry',
      userId: event.userId,
      sessionId: event.sessionId,
      properties: {
        event_id: event.id,
        event_name: event.title,
        attendees: event.attendees,
      },
    });
  }
}

// Export singleton instance
export const analyticsClient = new AnalyticsClient();
