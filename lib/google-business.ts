/**
 * Google My Business API integration for store hours
 * This module handles fetching and syncing business hours from Google My Business
 */

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface GoogleBusinessHours {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
}

// Fallback hours in case Google API is unavailable
export const FALLBACK_HOURS: BusinessHours = {
  monday: "12–8 PM",
  tuesday: "12–8 PM", 
  wednesday: "12–8 PM",
  thursday: "12–8 PM",
  friday: "12–9 PM",
  saturday: "12–9 PM",
  sunday: "12–5 PM"
};

/**
 * Convert Google My Business hours format to readable format
 */
function formatGoogleHours(googleHours: GoogleBusinessHours[]): BusinessHours {
  const hours: Partial<BusinessHours> = {};
  
  googleHours.forEach(period => {
    const day = period.dayOfWeek.toLowerCase() as keyof BusinessHours;
    const openTime = formatTime(period.openTime);
    const closeTime = formatTime(period.closeTime);
    
    if (openTime && closeTime) {
      hours[day] = `${openTime} - ${closeTime}`;
    } else {
      hours[day] = "Closed";
    }
  });
  
  // Fill in any missing days as closed
  const days: (keyof BusinessHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(day => {
    if (!hours[day]) {
      hours[day] = "Closed";
    }
  });
  
  return hours as BusinessHours;
}

/**
 * Convert 24-hour time to 12-hour format
 */
function formatTime(time24: string): string {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute.toString().padStart(2, '0');
  
  return `${hour12}:${minuteStr} ${period}`;
}

/**
 * Fetch business hours from Google My Business API
 */
export async function fetchGoogleBusinessHours(): Promise<BusinessHours> {
  try {
    // Check if Google My Business sync is enabled
    const enableGoogleSync = process.env.ENABLE_GOOGLE_HOURS_SYNC === 'true';
    if (!enableGoogleSync) {
      return FALLBACK_HOURS;
    }

    const apiKey = process.env.GOOGLE_MY_BUSINESS_API_KEY;
    const accountId = process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID;
    const locationId = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;
    const accessToken = process.env.GOOGLE_MY_BUSINESS_ACCESS_TOKEN;

    if (!apiKey || !accountId || !locationId || !accessToken) {
      console.log('Google My Business API credentials not configured, using fallback hours');
      return FALLBACK_HOURS;
    }

    // Fetch from Google My Business API
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google My Business API error: ${response.status}`);
    }

    const data = await response.json();
    const googleHours = data.regularHours?.periods || [];
    
    if (googleHours.length === 0) {
      console.log('No business hours found in Google My Business, using fallback');
      return FALLBACK_HOURS;
    }

    return formatGoogleHours(googleHours);
  } catch (error) {
    console.error('Error fetching Google Business hours:', error);
    return FALLBACK_HOURS;
  }
}

/**
 * Get formatted hours for display
 */
export function getFormattedHours(hours: BusinessHours): string[] {
  return [
    `Sunday: ${hours.sunday}`,
    `Monday: ${hours.monday}`,
    `Tuesday: ${hours.tuesday}`,
    `Wednesday: ${hours.wednesday}`,
    `Thursday: ${hours.thursday}`,
    `Friday: ${hours.friday}`,
    `Saturday: ${hours.saturday}`
  ];
}

/**
 * Get compact hours for footer display
 */
export function getCompactHours(hours: BusinessHours): string[] {
  return [
    `Mon-Thu: ${hours.monday}`,
    `Fri-Sat: ${hours.friday}`,
    `Sun: ${hours.sunday}`
  ];
}

/**
 * Check if store is currently open
 */
export function isStoreOpen(hours: BusinessHours): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours;
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  const todayHours = hours[currentDay];
  if (todayHours === "Closed") return false;
  
  // Parse the hours (e.g., "12–8 PM")
  const [openTime, closeTime] = todayHours.split('–');
  if (!openTime || !closeTime) return false;
  
  // Convert to 24-hour format for comparison
  const open24 = convertTo24Hour(openTime.trim());
  const close24 = convertTo24Hour(closeTime.trim());
  
  return currentTime >= open24 && currentTime <= close24;
}

/**
 * Convert 12-hour time to 24-hour format for comparison
 */
function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  let hour24 = parseInt(time, 10);
  
  // Handle case where there are no minutes (e.g., "12 PM" instead of "12:00 PM")
  const minutes = time.includes(':') ? time.split(':')[1] : '00';
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
}
