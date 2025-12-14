/**
 * Square Web Payments SDK Type Definitions
 * 
 * These types define the Square SDK structure for TypeScript.
 * The Square SDK is loaded via script tag in index.html.
 */

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string
      ) => Promise<SquarePayments>
    }
  }
}

export type SquarePayments = {
  card: () => Promise<SquareCard>
  applePay: (paymentRequest: SquarePaymentRequest) => Promise<SquareApplePay>
  googlePay: (paymentRequest: SquarePaymentRequest) => Promise<SquareGooglePay>
  paymentRequest: (options: SquarePaymentRequestOptions) => SquarePaymentRequest
  // Note: paymentRequest is a method on the payments instance
}

export type SquareCard = {
  attach: (elementId: string) => Promise<void>
  tokenize: () => Promise<SquareTokenResult>
  destroy: () => Promise<void>
}

export type SquareApplePay = {
  attach: (elementId: string) => Promise<void>
  addEventListener: (event: 'tokenization', handler: (e: SquareTokenizationEvent) => void) => void
  destroy: () => Promise<void>
}

export type SquareGooglePay = {
  attach: (elementId: string) => Promise<void>
  addEventListener: (event: 'tokenization', handler: (e: SquareTokenizationEvent) => void) => void
  destroy: () => Promise<void>
}

export type SquarePaymentRequest = {
  // Payment request object used for wallet methods
}

export type SquarePaymentRequestOptions = {
  countryCode: string
  currencyCode: string
  total: {
    amount: string
    label: string
  }
}

export type SquareTokenResult = {
  status: 'OK' | 'ERROR'
  token?: string
  errors?: Array<{
    message?: string
    detail?: string
    field?: string
    code?: string
  }>
  details?: {
    card?: {
      brand?: string
      last4?: string
      expMonth?: string
      expYear?: string
    }
  }
}

export type SquareTokenizationEvent = {
  detail?: {
    tokenResult?: SquareTokenResult
  }
}
