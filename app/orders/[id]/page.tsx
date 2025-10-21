"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, Calendar, DollarSign, User, MapPin, Phone, Mail, Edit, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  id: string;
  state: string;
  totalMoney: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    name: string;
    quantity: string;
    basePriceMoney: {
      amount: number;
      currency: string;
    };
    catalogObjectId: string;
  }>;
  customerId?: string;
  note?: string;
  fulfillments?: Array<{
    type: string;
    state: string;
    shipmentDetails?: {
      recipient: {
        address: {
          addressLine1: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
      };
    };
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/square/orders/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setNoteText(data.order.note || '');
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderNote = async () => {
    try {
      const response = await fetch(`/api/square/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setEditingNote(false);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg border border-neutral-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-100 py-12">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-dark mb-2">Order Not Found</h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Link 
              href="/orders"
              className="bg-accent-teal text-white px-6 py-3 rounded-lg hover:bg-accent-teal/90 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">Order #{order.id}</h1>
            <div className="flex items-center gap-4 text-neutral-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatAmount(order.totalMoney.amount, order.totalMoney.currency)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.state)}`}>
              {order.state}
            </span>
            <Link
              href="/orders"
              className="text-accent-teal hover:text-accent-amber transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.lineItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded"></div>
                      <div>
                        <h3 className="font-medium text-text-dark">{item.name}</h3>
                        <p className="text-sm text-neutral-600">SKU: {item.catalogObjectId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-dark">
                        {formatAmount(item.basePriceMoney.amount, item.basePriceMoney.currency)}
                      </p>
                      <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-dark">Order Notes</h2>
                <button
                  onClick={() => setEditingNote(!editingNote)}
                  className="text-accent-teal hover:text-accent-amber transition-colors flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  {editingNote ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {editingNote ? (
                <div className="space-y-4">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note to this order..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={updateOrderNote}
                      className="bg-accent-teal text-white px-4 py-2 rounded-lg hover:bg-accent-teal/90 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Save Note
                    </button>
                    <button
                      onClick={() => {
                        setEditingNote(false);
                        setNoteText(order.note || '');
                      }}
                      className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-600">
                  {order.note || 'No notes added to this order.'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>{formatAmount(order.totalMoney.amount, order.totalMoney.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatAmount(order.totalMoney.amount, order.totalMoney.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {order.customerId && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">Customer</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-neutral-500" />
                    <span>Customer ID: {order.customerId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {order.fulfillments && order.fulfillments.length > 0 && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">Shipping</h3>
                {order.fulfillments.map((fulfillment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-neutral-500" />
                      <span className="capitalize">{fulfillment.type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(fulfillment.state)}`}>
                        {fulfillment.state}
                      </span>
                    </div>
                    {fulfillment.shipmentDetails?.recipient?.address && (
                      <div className="text-sm text-neutral-600 ml-6">
                        <p>{fulfillment.shipmentDetails.recipient.address.addressLine1}</p>
                        <p>
                          {fulfillment.shipmentDetails.recipient.address.city}, {' '}
                          {fulfillment.shipmentDetails.recipient.address.state} {' '}
                          {fulfillment.shipmentDetails.recipient.address.postalCode}
                        </p>
                        <p>{fulfillment.shipmentDetails.recipient.address.country}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-accent-teal text-white py-2 px-4 rounded-lg hover:bg-accent-teal/90 transition-colors">
                  Update Status
                </button>
                <button className="w-full border border-neutral-300 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-50 transition-colors">
                  Print Order
                </button>
                <button className="w-full border border-neutral-300 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-50 transition-colors">
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
