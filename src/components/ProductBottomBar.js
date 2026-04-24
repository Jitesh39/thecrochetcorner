"use client";

import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProductBottomBar({ product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    addItem(product, 1);
    router.push("/cart");
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-3 flex items-center justify-between z-[110] pb-safe">
      <div className="flex flex-col pl-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Price</p>
        <p className="text-xl font-black text-gray-900">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAddToCart}
          className="px-5 py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 active:scale-95 transition-all bg-white"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
