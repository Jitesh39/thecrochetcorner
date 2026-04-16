"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, limit, query } from "firebase/firestore";

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
    <section className="py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-text-main)] mb-4">
            Bestselling Products
          </h2>
          <div className="h-1 w-20 bg-[var(--color-primary)] mx-auto rounded-full"></div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center font-bold text-gray-400">Syncing latest products...</div>
          ) : products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              {/* Product Image Area */}
              <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* Badge */}
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
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-serif text-[var(--color-text-main)] leading-snug pr-4">
                    {product.name}
                  </h3>
                  <p className="text-lg font-medium text-[var(--color-primary)] whitespace-nowrap">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < 5 ? "currentColor" : "none"}
                        className={i < 5 ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                    (Handmade)
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addItem(product)}
                  className="mt-auto w-full flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-full text-sm text-[var(--color-text-main)] font-medium transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] shadow-sm"
                >
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
