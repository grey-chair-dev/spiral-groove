"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Music, ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { FormattedProduct } from "@/lib/types/square";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        setAuthenticated(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, variationId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId, variationId);
    } else {
      updateQuantity(productId, variationId, newQuantity);
    }
  };

  const handleRemove = (productId: string, variationId: string) => {
    removeFromCart(productId, variationId);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    setError(null);

    try {
      // Create checkout with all cart items
      // For now, we'll create a checkout for the first item
      // In a full implementation, you'd want to create an order with all items
      const firstItem = items[0];
      const variation = firstItem.product.variations.find(v => v.id === firstItem.variationId);
      
      if (!variation) {
        throw new Error('Invalid product variation');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: firstItem.product.id,
          variationId: firstItem.variationId,
          quantity: firstItem.quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to Square checkout URL
        if (data.data.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else {
          setError('Checkout URL not available');
        }
      } else {
        setError(data.error || 'Failed to create checkout');
      }
    } catch (err) {
      setError('Failed to process checkout');
      console.error('Checkout error:', err);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Back to catalog"
          >
            <ArrowLeft size={20} />
          </button>
          <ShoppingCart className="text-cyan-400" size={24} />
          <h1 className="text-xl sm:text-2xl font-bold">Shopping Cart</h1>
          {totalItems > 0 && (
            <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-full text-xs font-semibold">
              {totalItems}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm sm:text-base"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart size={64} className="text-white/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-white/60 mb-6">Add some items to get started!</p>
              <button
                onClick={() => router.push('/home')}
                className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-semibold"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-6">Cart Items ({totalItems})</h2>
                
                {items.map((item) => {
                  const variation = item.product.variations.find(v => v.id === item.variationId);
                  const price = variation?.itemVariationData?.priceMoney?.amount
                    ? Number(variation.itemVariationData.priceMoney.amount) / 100
                    : item.product.price || 0;
                  const itemTotal = price * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.variationId}`}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="relative w-full sm:w-24 h-24 bg-black/20 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music size={32} className="text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              {item.product.artist && (
                                <p className="text-white/70 text-sm mb-1 line-clamp-1">
                                  {item.product.artist}
                                </p>
                              )}
                              <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                                {item.product.album}
                              </h3>
                              {variation?.itemVariationData?.name && (
                                <p className="text-white/60 text-xs">
                                  {variation.itemVariationData.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemove(item.product.id, item.variationId)}
                              className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.variationId, item.quantity - 1)}
                                className="p-1.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="text-white font-semibold w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.variationId, item.quantity + 1)}
                                className="p-1.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-cyan-400 font-bold text-lg">
                                ${itemTotal.toFixed(2)}
                              </p>
                              <p className="text-white/60 text-xs">
                                ${price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 sticky top-24">
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-white/80">
                      <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                      <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Tax</span>
                      <span className="font-semibold">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-cyan-400">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || items.length === 0}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>

                  <button
                    onClick={() => router.push('/home')}
                    className="w-full mt-3 px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

