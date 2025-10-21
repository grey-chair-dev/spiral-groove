"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
  customerId?: string;
  orderId?: string;
}

export default function PaymentForm({ 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError, 
  customerId,
  orderId 
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'digital_wallet'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardDetails.number || cardDetails.number.length < 13) {
      newErrors.number = 'Please enter a valid card number';
    }
    
    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter expiry in MM/YY format';
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.name = 'Please enter cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (!validateCard()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // In a real implementation, you would use Square's Web Payments SDK
      // For now, we'll simulate the payment process
      const paymentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        sourceId: 'simulated_source_id', // This would come from Square's Web Payments SDK
        orderId,
        customerId,
        note: `Payment for order ${orderId || 'N/A'}`
      };

      const response = await fetch('/api/square/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.payment);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      onError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
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
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="w-5 h-5 text-accent-teal" />
        <h3 className="text-lg font-semibold text-text-dark">Secure Payment</h3>
        <div className="ml-auto text-sm text-neutral-500">
          Powered by Square
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-dark mb-3">
          Payment Method
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              paymentMethod === 'card'
                ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                : 'border-neutral-300 text-neutral-600 hover:border-accent-teal'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('digital_wallet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              paymentMethod === 'digital_wallet'
                ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                : 'border-neutral-300 text-neutral-600 hover:border-accent-teal'
            }`}
          >
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            Digital Wallet
          </button>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal ${
                errors.number ? 'border-red-300' : 'border-neutral-300'
              }`}
              maxLength={19}
            />
            {errors.number && (
              <p className="text-sm text-red-600 mt-1">{errors.number}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              placeholder="John Doe"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal ${
                errors.name ? 'border-red-300' : 'border-neutral-300'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                placeholder="MM/YY"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal ${
                  errors.expiry ? 'border-red-300' : 'border-neutral-300'
                }`}
                maxLength={5}
              />
              {errors.expiry && (
                <p className="text-sm text-red-600 mt-1">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal ${
                  errors.cvv ? 'border-red-300' : 'border-neutral-300'
                }`}
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'digital_wallet' && (
        <div className="text-center py-8">
          <div className="text-neutral-500 mb-4">
            Digital wallet integration coming soon
          </div>
          <div className="flex justify-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <div className="w-8 h-8 bg-green-500 rounded"></div>
            <div className="w-8 h-8 bg-purple-500 rounded"></div>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="mt-6 pt-6 border-t border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-text-dark">Total</span>
          <span className="text-lg font-bold text-text-dark">
            ${amount.toFixed(2)} {currency}
          </span>
        </div>

        <button
          onClick={processPayment}
          disabled={loading}
          className="w-full bg-accent-teal text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>

        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
          <CheckCircle className="w-3 h-3" />
          <span>Secured by Square • SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}
