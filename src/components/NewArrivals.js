"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by updatedAt or createdAt descending and take top 5
      const sorted = productsData.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setProducts(sorted.slice(0, 5));
      setLoading(false);
    });

    return () => unsubProducts();
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-24 bg-[#faf9f8] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-10 lg:mb-16 animate-fade-in px-4">
          <div className="max-w-2xl mx-auto">
            <span className="text-[var(--color-primary)] font-medium text-[10px] uppercase tracking-[0.4em] mb-4 block">
              JUST IN
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-4 leading-tight">
              New Arrivals
            </h2>
            <div className="h-0.5 w-16 bg-[var(--color-primary)] mx-auto mt-6 opacity-30 lg:hidden"></div>
          </div>

          <Link
            href="/shop"
            className="hidden lg:flex absolute right-4 bottom-2 group items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 hover:shadow-md"
          >
            View All <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        {/* Product Grid / Horizontal Scroll */}
        {loading ? (
          <div className="py-20 text-center font-bold text-gray-400">Loading new arrivals...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-xl font-serif">No products available</p>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-6">
              {products.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={`group bg-[#f5f1ed]/50 hover:bg-white rounded-[1.5rem] p-4 transition-all duration-500 shadow-sm hover:shadow-2xl border border-transparent hover:border-gray-50 flex-col h-full transform hover:-translate-y-2 cursor-pointer relative ${idx === 4 ? 'hidden md:flex' : 'flex'}`}
                >
                  {/* Image Area */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center group-hover:bg-[#fcfbf9] transition-colors">
                    <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
                      <Image
                        src={product.imageUrl || "/img1.png"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 75vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-grow text-center sm:text-left">
                    <h4 className="text-sm md:text-base font-serif text-[var(--color-text-main)] mb-1 line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                      {product.name}
                    </h4>

                    <div className="flex items-center justify-center sm:justify-start gap-1 mb-2 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] text-gray-400 font-medium ml-1">
                        5.0
                        {(() => {
                          const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
                          const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
                          return <span className="text-gray-300 ml-1">({displayCount})</span>;
                        })()}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <span className="text-lg font-bold text-[var(--color-text-main)]">₹{product.price}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product);
                        }}
                        className="p-2.5 rounded-full bg-white border border-gray-100 text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300 shadow-sm hover:shadow-lg group/btn relative z-10"
                      >
                        <ShoppingCart size={16} strokeWidth={1.5} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-10 flex justify-center lg:hidden">
              <Link
                href="/shop"
                className="group flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all bg-white px-8 py-3.5 rounded-full shadow-sm border border-gray-100 hover:shadow-md"
              >
                View All <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
