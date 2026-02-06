/**
 * Square Web Payments SDK Integration
 * 
 * This service handles Square payment token generation and payment processing.
 * The payment token is sent to your backend API to process the actual payment.
 * 
 * Note: Square Web SDK must be loaded via script tag in index.html
 * <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
 * or for production:
 * <script src="https://web.squarecdn.com/v1/square.js"></script>
 */

// Square SDK types (loaded from global Square object)
declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => Promise<SquarePayments>
    }
  }
}

export type SquarePayments = {
  card: () => Promise<SquareCard>
  googlePay: (options?: any) => Promise<any>
  // Add other payment methods as needed
}

export type SquareCard = {
  attach: (elementId: string) => Promise<void>
  tokenize: () => Promise<SquareTokenResult>
  destroy: () => Promise<void>
}

export type SquareTokenResult = {
  status: 'OK' | 'ERROR'
  token?: string
  errors?: Array<{ detail: string; field?: string }>
  details?: {
    card?: {
      brand?: string
      last4?: string
      expMonth?: string
      expYear?: string
    }
  }
}

export type SquarePaymentToken = {
  token: string
  cardBrand?: string
  last4?: string
  expMonth?: string
  expYear?: string
}

export type SquarePaymentResult = {
  success: boolean
  token?: SquarePaymentToken
  error?: string
}

/**
 * Initialize Square Payments SDK
 * @param applicationId - Your Square application ID from environment variables
 * @param locationId - Your Square location ID
 * @returns Square Payments instance or null if initialization fails
 */
export async function initializeSquarePayments(
  applicationId: string,
  locationId: string
): Promise<SquarePayments | null> {
  try {
    if (!applicationId || !locationId) {
      return null
    }

    if (!window.Square) {
      return null
    }

    const squarePayments = await window.Square.payments(applicationId, locationId)
    return squarePayments
  } catch (error) {
    void error
    return null
  }
}

/**
 * Generate a payment token from Square card entry
 * @param cardElement - The Square Card element instance
 * @returns Payment token result
 */
export async function generatePaymentToken(
  cardElement: SquareCard
): Promise<SquarePaymentResult> {
  try {
    // Tokenize the card
    const tokenResult = await cardElement.tokenize()

    if (tokenResult.status === 'OK' && tokenResult.token) {
      // Extract card details if available
      const cardData = tokenResult.details?.card
      
      return {
        success: true,
        token: {
          token: tokenResult.token,
          cardBrand: cardData?.brand,
          last4: cardData?.last4,
          expMonth: cardData?.expMonth,
          expYear: cardData?.expYear,
        },
      }
    } else {
      const errorMessage =
        tokenResult.errors && tokenResult.errors.length > 0
          ? tokenResult.errors
              .map((e) => (e?.detail || '').trim())
              .filter(Boolean)
              .slice(0, 3)
              .join(' · ')
          : ''
      return {
        success: false,
        error: errorMessage || 'Card details could not be verified. Please check and try again.',
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Card details could not be verified. Please try again.',
    }
  }
}

/**
 * Process payment on backend
 * This should call your backend API endpoint that processes the payment token
 * @param paymentToken - The payment token from Square
 * @param amount - Payment amount in cents
 * @param orderData - Additional order data to send with payment
 * @returns Payment processing result
 */
export async function processPayment(
  paymentToken: SquarePaymentToken,
  amount: number,
  orderData?: {
    pickupForm?: any
    shippingForm?: any // Legacy support
    cartItems?: any[]
    orderNumber?: string
  }
): Promise<{ success: boolean; orderId?: string; error?: string; totals?: { totalCents?: number|null; taxCents?: number|null; currency?: string } }> {
  try {
    // Use the secure payment endpoint (per API-109)
    // Vite only exposes variables with VITE_ prefix to frontend
    const apiEndpoint = import.meta.env.VITE_SQUARE_PAYMENT_API_URL || '/api/pay'
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sourceId: paymentToken.token,
        amountMoney: {
          amount: amount,
          currency: 'USD',
        },
        idempotencyKey: crypto.randomUUID(),
        ...orderData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Payment processing failed' }))
      const msg =
        errorData?.error ||
        errorData?.message ||
        errorData?.details?.message ||
        `Payment failed: ${response.status} ${response.statusText}`
      return {
        success: false,
        error: msg,
      }
    }

    const result = await response.json()
    const orderId =
      result?.orderId ||
      result?.id ||
      result?.payment?.localOrderNumber ||
      result?.payment?.orderId ||
      result?.payment?.id
    return {
      success: true,
      orderId,
      totals: result?.payment?.totals,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process payment',
    }
  }
}
