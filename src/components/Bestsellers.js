"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, limit, query } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const q = query(collection(db, "products"), limit(3));
    const unsub = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <section className="py-10 sm:py-12 lg:py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-text-main)] mb-4">
            Bestselling Products
          </h2>
          <div className="h-1 w-20 bg-[var(--color-primary)] mx-auto rounded-full"></div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
          {loading ? (
            <div className="col-span-full py-20 text-center font-bold text-gray-400">Syncing latest products...</div>
          ) : products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer max-w-md mx-auto w-full relative"
            >
              {/* Product Image Area */}
              <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <span className={`absolute top-4 left-4 bg-[var(--color-primary)] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10 shadow-sm`}>
                  {product.category || "Best Item"}
                </span>

                <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
                  <Image
                    src={product.imageUrl || "/img1.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg md:text-xl font-serif text-[var(--color-text-main)] leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg md:text-xl font-medium text-[var(--color-primary)] whitespace-nowrap">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < 5 ? "currentColor" : "none"}
                        className={i < 5 ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  {(() => {
                    const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
                    const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
                    return <span className="text-xs text-gray-400 font-medium ml-1">({displayCount})</span>;
                  })()}
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem(product);
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-full text-sm text-[var(--color-text-main)] font-bold transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] shadow-md relative z-10"
                >
                  <ShoppingBag size={18} strokeWidth={2} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </Link>
          ))}
        </div>



      </div>
    </section>
  );
}
