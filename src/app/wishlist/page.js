"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = (product) => {
    addItemToCart(product);
    // Optional: remove from wishlist when added to cart?
    // removeItem(product.id);
    toast.success("Added to cart!");
  };

  if (!mounted) return null;

  return (
    <div className="bg-[var(--color-background)] min-h-screen pt-0 lg:pt-12 pb-12 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-[var(--color-primary)] p-3 rounded-2xl text-white shadow-lg shadow-[var(--color-primary)]/20">
            <Heart size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-[var(--color-text-main)] font-bold">My Wishlist</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-20 text-center shadow-sm border border-gray-100 flex flex-col items-center max-w-2xl mx-auto">
            <div className="bg-[#fcf8f8] p-10 rounded-full mb-8 text-[var(--color-primary)]/20">
              <Heart size={80} strokeWidth={1} />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[var(--color-text-main)] mb-4 font-bold">Your wishlist is empty</h2>
            <p className="text-[var(--color-text-muted)] mb-10 max-w-sm mx-auto">
              Save items you love and they will show up here. Start exploring our handmade collection!
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-primary)] text-white rounded-full font-bold text-lg shadow-xl shadow-[var(--color-primary)]/25 hover:scale-105 active:scale-95 transition-all"
            >
              Start Shopping <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-full transform hover:-translate-y-2"
              >
                {/* Product Image Area */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.imageUrl || "/img1.png"}
                    alt={item.name}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  <button
                    onClick={() => {
                      removeItem(item.id);
                      toast.success("Removed from wishlist");
                    }}
                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)] font-bold mb-2 block">
                      {item.category || "Handmade"}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-bold text-[var(--color-text-main)]">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
