"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import PaymentForm from '@/components/PaymentForm';
import { ShoppingCart, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  const handlePaymentSuccess = async (payment: any) => {
    try {
      // Create order in Square
      const orderResponse = await fetch('/api/square/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          customerId: null, // You could create a customer record here
          shippingAddress: {
            addressLine1: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postalCode: shippingInfo.zip,
            country: shippingInfo.country
          }
        })
      });

      const orderData = await orderResponse.json();
      
      if (orderData.success) {
        setOrderId(orderData.order.id);
        setPaymentSuccess(true);
        clearCart();
        setStep(4);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You could show an error message to the user
  };

  if (cart.length === 0 && !paymentSuccess) {
    return (
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container max-w-4xl">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-dark mb-2">Your cart is empty</h1>
            <p className="text-neutral-600 mb-6">Add some records to get started!</p>
            <Link 
              href="/shop"
              className="bg-accent-teal text-white px-6 py-3 rounded-lg hover:bg-accent-teal/90 transition-colors"
            >
              Browse Records
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-dark mb-2">Payment Successful!</h1>
            <p className="text-neutral-600 mb-6">
              Thank you for your order. You'll receive a confirmation email shortly.
            </p>
            {orderId && (
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-600">Order ID: {orderId}</p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Link 
                href="/shop"
                className="bg-accent-teal text-white px-6 py-3 rounded-lg hover:bg-accent-teal/90 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link 
                href="/orders"
                className="border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">Checkout</h1>
          <p className="text-neutral-600">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNumber 
                        ? 'bg-accent-teal text-white' 
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step > stepNumber ? 'bg-accent-teal' : 'bg-neutral-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm text-neutral-600">
                <span>Shipping</span>
                <span>Payment</span>
                <span>Review</span>
              </div>
            </div>

            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-accent-teal" />
                  <h2 className="text-xl font-semibold text-text-dark">Shipping Information</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">First Name</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Last Name</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-dark mb-2">Address</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">City</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">State</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-accent-teal text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent-teal/90 transition-colors mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-accent-teal" />
                  <h2 className="text-xl font-semibold text-text-dark">Payment Information</h2>
                </div>
                
                <PaymentForm
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-neutral-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-200 rounded"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-dark">{item.title}</p>
                      <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-text-dark">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-neutral-200 pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-4 p-3 bg-accent-teal/10 rounded-lg">
                  <p className="text-sm text-accent-teal">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
