"use client";

import { useState, useEffect } from 'react';
import { Package, Search, Filter, Calendar, DollarSign, User } from 'lucide-react';
import Link from 'next/link';

interface Order {
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
  }>;
  customerId?: string;
  note?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/square/orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.lineItems.some(item => 
                           item.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || order.state.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      month: 'short',
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
        <div className="container max-w-6xl">
          <div className="bg-white rounded-lg border border-neutral-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                ))}
              </div>
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
          <h1 className="text-3xl font-bold text-text-dark mb-2">Order Management</h1>
          <p className="text-neutral-600">Track and manage all orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-accent-teal appearance-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-accent-teal text-white px-4 py-2 rounded-lg hover:bg-accent-teal/90 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-dark mb-2">No orders found</h2>
            <p className="text-neutral-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'No orders match your current filters.' 
                : 'No orders have been placed yet.'}
            </p>
            <Link 
              href="/shop"
              className="bg-accent-teal text-white px-6 py-3 rounded-lg hover:bg-accent-teal/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-accent-teal" />
                    <div>
                      <h3 className="font-semibold text-text-dark">Order #{order.id}</h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatAmount(order.totalMoney.amount, order.totalMoney.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.state)}`}>
                      {order.state}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-accent-teal hover:text-accent-amber transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-neutral-200 pt-4">
                  <h4 className="font-medium text-text-dark mb-2">Items ({order.lineItems.length})</h4>
                  <div className="space-y-2">
                    {order.lineItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-600">Qty: {item.quantity}</span>
                          <span className="font-medium">
                            {formatAmount(item.basePriceMoney.amount, item.basePriceMoney.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.lineItems.length > 3 && (
                      <p className="text-sm text-neutral-500">
                        +{order.lineItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {order.note && (
                  <div className="border-t border-neutral-200 pt-4 mt-4">
                    <h4 className="font-medium text-text-dark mb-1">Note</h4>
                    <p className="text-sm text-neutral-600">{order.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
