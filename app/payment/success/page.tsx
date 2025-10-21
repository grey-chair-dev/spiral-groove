"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/square/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-4xl">
        {/* Success Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text-dark mb-2">Payment Successful!</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          
          {orderId && (
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-600">Order ID: {orderId}</p>
              {paymentId && (
                <p className="text-sm text-neutral-600">Payment ID: {paymentId}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Order Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-text-dark mb-2">Order Information</h3>
                <div className="space-y-1 text-sm text-neutral-600">
                  <p>Order ID: {orderDetails.id}</p>
                  <p>Status: {orderDetails.state}</p>
                  <p>Total: ${(orderDetails.totalMoney?.amount / 100).toFixed(2)} {orderDetails.totalMoney?.currency}</p>
                  <p>Created: {new Date(orderDetails.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-text-dark mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm text-neutral-600">
                  <p>Payment Status: Completed</p>
                  <p>Payment Method: Card</p>
                  <p>Processed: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Package className="w-8 h-8 text-accent-teal mx-auto mb-2" />
              <h3 className="font-medium text-text-dark mb-1">Order Processing</h3>
              <p className="text-sm text-neutral-600">
                We'll prepare your order for shipping within 1-2 business days.
              </p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-accent-teal mx-auto mb-2" />
              <h3 className="font-medium text-text-dark mb-1">Email Confirmation</h3>
              <p className="text-sm text-neutral-600">
                You'll receive a detailed confirmation email with tracking information.
              </p>
            </div>
            <div className="text-center">
              <Phone className="w-8 h-8 text-accent-teal mx-auto mb-2" />
              <h3 className="font-medium text-text-dark mb-1">Need Help?</h3>
              <p className="text-sm text-neutral-600">
                Contact us at (513) 600-8018 if you have any questions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/shop"
            className="bg-accent-teal text-white px-6 py-3 rounded-lg hover:bg-accent-teal/90 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/orders"
            className="border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            View All Orders
          </Link>
          <Link 
            href="/contact"
            className="border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
