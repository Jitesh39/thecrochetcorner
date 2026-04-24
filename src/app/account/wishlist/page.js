"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">My Wishlist</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-medium">Save your favorite handcrafted items for later.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-6">
            <Heart size={24} />
         </div>
         <h3 className="text-lg font-bold text-gray-800">Your wishlist is empty</h3>
         <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            You haven't saved any items yet. Explore our collection and find something you love!
         </p>
         <Link href="/shop" className="w-[180px] py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all mt-8 text-sm">
            Explore Shop
          </Link>
      </div>
    </div>
  );
}
