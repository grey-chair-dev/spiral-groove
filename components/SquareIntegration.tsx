"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface SquareStatus {
  configured: boolean;
  connected: boolean;
  products: number;
  orders: number;
  lastSync: string | null;
}

export default function SquareIntegration() {
  const [status, setStatus] = useState<SquareStatus>({
    configured: false,
    connected: false,
    products: 0,
    orders: 0,
    lastSync: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSquareStatus();
  }, []);

  const checkSquareStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Square is configured
      const configResponse = await fetch('/api/square/status');
      const configData = await configResponse.json();

      if (configData.configured) {
        // Check connection and get stats
        const [productsResponse, ordersResponse] = await Promise.all([
          fetch('/api/square/products'),
          fetch('/api/square/orders')
        ]);

        const productsData = await productsResponse.json();
        const ordersData = await ordersResponse.json();

        setStatus({
          configured: true,
          connected: true,
          products: productsData.products?.length || 0,
          orders: ordersData.orders?.length || 0,
          lastSync: new Date().toISOString()
        });
      } else {
        setStatus({
          configured: false,
          connected: false,
          products: 0,
          orders: 0,
          lastSync: null
        });
      }
    } catch (err) {
      setError('Failed to check Square status');
      console.error('Square status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/square/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'products' })
      });

      if (response.ok) {
        await checkSquareStatus();
      } else {
        setError('Failed to sync products');
      }
    } catch (err) {
      setError('Failed to sync products');
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-teal" />
          <h3 className="text-lg font-semibold text-text-dark">Square Integration</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Square Integration</h3>
        <button
          onClick={checkSquareStatus}
          className="p-2 text-neutral-500 hover:text-accent-teal transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Configuration</span>
          <div className="flex items-center gap-2">
            {status.configured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {status.configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Connection</span>
          <div className="flex items-center gap-2">
            {status.connected ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {status.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Products Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Products</span>
          <span className="text-sm font-medium text-text-dark">
            {status.products.toLocaleString()}
          </span>
        </div>

        {/* Orders Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Orders</span>
          <span className="text-sm font-medium text-text-dark">
            {status.orders.toLocaleString()}
          </span>
        </div>

        {/* Last Sync */}
        {status.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Last Sync</span>
            <span className="text-sm font-medium text-text-dark">
              {new Date(status.lastSync).toLocaleString()}
            </span>
          </div>
        )}

        {/* Actions */}
        {status.configured && status.connected && (
          <div className="pt-4 border-t border-neutral-200">
            <button
              onClick={syncProducts}
              disabled={loading}
              className="w-full bg-accent-teal text-white px-4 py-2 rounded-lg hover:bg-accent-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Syncing...' : 'Sync Products'}
            </button>
          </div>
        )}

        {/* Setup Instructions */}
        {!status.configured && (
          <div className="pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-medium text-text-dark mb-2">Setup Required</h4>
              <p className="text-sm text-neutral-600 mb-3">
                Configure your Square API credentials to enable integration.
              </p>
              <a
                href="/docs/square-setup"
                className="text-sm text-accent-teal hover:text-accent-amber transition-colors"
              >
                View Setup Guide →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
