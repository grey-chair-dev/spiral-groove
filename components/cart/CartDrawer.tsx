"use client";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { trackCheckoutDemo } from "@/lib/analytics";

export default function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const toggle = useStore((s) => s.toggleCart);
  const items = useStore((s) => s.items);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const total = mounted ? items.reduce((sum, i) => sum + i.price * i.qty, 0) : 0;

  return (
        <aside className={"fixed right-0 top-20 h-[calc(100vh-5rem)] w-full sm:w-[420px] bg-white border-l border-neutral-200 shadow-2xl transition-transform " + (open ? "translate-x-0" : "translate-x-full")}>
      <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-black">Your Cart</h3>
            <button className="btn text-black" onClick={toggle}>Close</button>
          </div>
        <div className="p-4 space-y-3 overflow-auto flex-1">
          {mounted && items.length === 0 && <p className="text-sm text-black">Your cart is empty.</p>}
          {mounted && items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="size-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={i.cover || '/images/placeholders/vinyl.jpg'}
                  alt={`${i.title} at Spiral Groove Records`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-black">{i.title}</div>
                <div className="text-xs text-neutral-600">${i.price.toFixed(2)} each</div>
              </div>
              <div className="flex items-center gap-2">
                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(i.id, i.qty - 1)}
                    className="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    disabled={!mounted}
                    aria-label={`Decrease quantity of ${i.title}`}
                  >
                    <Minus size={12} className="text-black" />
                  </button>
                  <span className="text-sm font-medium text-black min-w-[20px] text-center">{i.qty}</span>
                  <button
                    onClick={() => updateQuantity(i.id, i.qty + 1)}
                    className="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    disabled={!mounted}
                    aria-label={`Increase quantity of ${i.title}`}
                  >
                    <Plus size={12} className="text-black" />
                  </button>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(i.id)}
                  className="w-6 h-6 rounded-full border border-red-300 flex items-center justify-center hover:bg-red-50 transition-colors"
                  disabled={!mounted}
                  aria-label={`Remove ${i.title} from cart`}
                >
                  <Trash2 size={12} className="text-red-600" />
                </button>
              </div>
              <div className="text-sm font-semibold text-black min-w-[60px] text-right">
                ${(i.price * i.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black">Subtotal</span>
            <span className="font-semibold text-black">${total.toFixed(2)}</span>
          </div>
          <button 
            className="btn w-full"
            aria-label="Proceed to checkout (demo mode)"
            onClick={() => trackCheckoutDemo()}
          >
            Checkout (demo)
          </button>
        </div>
      </div>
    </aside>
  );
}
