import type { SquarePaymentToken } from '../services/squarePayment'

export type PaymentForm = {
  paymentToken: SquarePaymentToken | null
  cardholderName: string
}

export type PickupForm = {
  email: string
  firstName: string
  lastName: string
  phone: string
  pickupLocation?: string
}
