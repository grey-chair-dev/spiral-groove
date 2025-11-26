"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Music, ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { FormattedProduct } from "@/lib/types/square";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
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

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    setError(null);

    try {
      // Create checkout for all items in cart
      const checkoutItems = items.map(item => ({
        productId: item.product.id,
        variationId: item.variationId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          // Include first item for backward compatibility
          productId: items[0].product.id,
          variationId: items[0].variationId,
          quantity: items[0].quantity,
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

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

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
              <p className="text-white/60 mb-6">Add some products to get started!</p>
              <button
                onClick={() => router.push('/home')}
                className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-semibold"
              >
                Continue Shopping
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
                      className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-black/20 rounded-lg overflow-hidden">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="128px"
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
                              {item.product.artist ? (
                                <>
                                  <p className="text-white/70 text-sm mb-1">{item.product.artist}</p>
                                  <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                                    {item.product.album}
                                  </h3>
                                </>
                              ) : (
                                <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                                  {item.product.album}
                                </h3>
                              )}
                              {variation?.itemVariationData?.name && (
                                <p className="text-white/60 text-xs">
                                  {variation.itemVariationData.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.variationId)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-red-400 ml-2"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-white/60 text-sm">Quantity:</span>
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variationId, item.quantity - 1)}
                                  className="p-1.5 hover:bg-white/10 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variationId, item.quantity + 1)}
                                  className="p-1.5 hover:bg-white/10 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
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
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-white/80">
                      <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-cyan-400">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || items.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
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

                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full mt-3 px-4 py-2 text-white/60 hover:text-red-400 transition-colors text-sm"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
