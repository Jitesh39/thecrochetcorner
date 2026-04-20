"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to checkout", { 
        duration: 5000,
        icon: '🔒'
      });

      // Delay redirection by 2 seconds
      setTimeout(() => {
        router.push("/login?redirect=/checkout");
      }, 2000);
      return;
    }
    router.push("/checkout");
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-text-main)] mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="bg-gray-50 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-3">Your cart is empty</h2>
            <p className="text-[var(--color-text-muted)] mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <Image
                      src={item.imageUrl || item.image || (item.images && item.images[0]) || "/img1.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                    <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                      {item.category}
                    </div>
                    <Link href={`/product/${item.id}`} className="text-lg font-serif text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-colors mb-2">
                      {item.name}
                    </Link>
                    <p className="text-[var(--color-text-main)] font-medium mb-4 sm:mb-0">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="font-medium text-lg w-20 text-center sm:text-right hidden sm:block">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 md:bg-transparent bg-red-50 md:rounded-none rounded-full w-full sm:w-auto flex justify-center"
                    >
                      <Trash2 size={20} />
                      <span className="ml-2 sm:hidden text-red-500 text-sm">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-6 border-b border-gray-100 pb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[var(--color-text-main)] font-medium">Total</span>
                    <div className="text-right">
                      <span className="text-sm text-[var(--color-text-muted)] block mb-1">INR</span>
                      <span className="text-2xl font-serif text-[var(--color-text-main)] font-medium">
                        ₹{getCartTotal().toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full flex items-center justify-center py-4 text-lg focus:outline-none"
                >
                  Proceed to Checkout <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
