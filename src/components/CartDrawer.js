"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to checkout", {
        duration: 5000,
        icon: '🔒'
      });

      // Delay redirection by 2 seconds
      setTimeout(() => {
        closeDrawer();
        router.push("/login?redirect=/checkout");
      }, 2000);
      return;
    }
    closeDrawer();
    router.push("/checkout");
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <motion.div
          key="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDrawer}
          role="button"
          aria-label="Close cart"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        />
      )}
      {isDrawerOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.4 }}
          className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-[var(--color-primary)]" />
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-main)]">Your Cart</h2>
              <span className="bg-[var(--color-secondary)] text-[var(--color-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-[var(--color-primary)] active:scale-90"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Cart Items */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-6 py-6 bg-white">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pt-20">
                <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
                  <ShoppingBag size={64} strokeWidth={1} />
                </div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Cart is empty</h3>
                <p className="text-gray-400 text-sm mb-8 max-w-[200px] mx-auto">Looks like you haven't added any crochet magic yet!</p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  Explore Shop
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Product Image Thumbnail */}
                    <div className="relative w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 group-hover:shadow-md transition-shadow">
                      <Image
                        src={item.imageUrl || item.image || (item.images && item.images[0]) || "/img1.png"}
                        alt={item.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Product Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col py-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <Link
                          href={`/product/${item.productId || item.id}`}
                          onClick={closeDrawer}
                          className="text-sm font-bold text-[var(--color-text-main)] truncate pr-4 hover:text-[var(--color-primary)] transition-colors leading-tight"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] disabled:opacity-20 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-sm font-bold text-[var(--color-text-main)]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Checkout Summary Footer */}
          {items.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Subtotal</span>
                <span className="text-xs text-gray-400 italic">Taxes and shipping calculated later</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-serif font-bold text-lg">Total Amount</span>
                <span className="text-2xl font-serif font-bold text-[var(--color-primary)]">
                  ₹{getCartTotal().toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary)]/25 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest group focus:outline-none"
              >
                Proceed to Checkout
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex flex-col items-center gap-3 mt-6">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors underline underline-offset-4"
                >
                  View Full Cart Details
                </Link>
                <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Secure SSL Encrypted Checkout
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AnimatePresence>
  );
}
