// Square payment processing utilities
// This file handles client-side payment processing and validation

export interface SquarePaymentData {
  sourceId: string;
  amount: number;
  currency: string;
  orderId?: string;
  customerId?: string;
  note?: string;
}

export interface SquarePaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
}

// Square configuration for client-side
export const squareConfig = {
  applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
  environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox',
};

// Process a payment with Square
export async function processPayment(paymentData: SquarePaymentData): Promise<SquarePaymentResult> {
  try {
    const response = await fetch('/api/square/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        payment: result.payment,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Payment failed',
      };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'Payment processing failed. Please try again.',
    };
  }
}

// Validate card details
export function validateCardDetails(cardDetails: {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate card number
  if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 13) {
    errors.number = 'Please enter a valid card number';
  }

  // Validate expiry date
  if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
    errors.expiry = 'Please enter expiry in MM/YY format';
  } else {
    const [month, year] = cardDetails.expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      errors.expiry = 'Please enter a valid month';
    } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.expiry = 'Card has expired';
    }
  }

  // Validate CVV
  if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
    errors.cvv = 'Please enter a valid CVV';
  }

  // Validate cardholder name
  if (!cardDetails.name.trim()) {
    errors.name = 'Please enter cardholder name';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
}

// Format expiry date
export function formatExpiryDate(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
}

// Get card type from number
export function getCardType(number: string): string {
  const cleanNumber = number.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6/.test(cleanNumber)) return 'discover';
  
  return 'unknown';
}

// Test card numbers for sandbox
export const testCardNumbers = {
  visa: '4111 1111 1111 1111',
  mastercard: '5555 5555 5555 4444',
  amex: '3782 822463 10005',
  discover: '6011 1111 1111 1117',
};

// Sandbox test data
export const sandboxTestData = {
  cardNumbers: testCardNumbers,
  cvv: '123',
  expiry: '12/25',
  name: 'Test User',
  zipCode: '12345',
};
