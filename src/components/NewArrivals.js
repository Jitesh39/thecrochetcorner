"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageStates, setImageStates] = useState({});
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-6 sm:py-12 bg-[#faf9f8] overflow-hidden">
      <div className="w-full">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-10 lg:mb-16 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <span className="text-[var(--color-primary)] font-medium text-[10px] uppercase tracking-[0.4em] mb-4 block">
              JUST IN
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[var(--color-text-main)] mb-4 leading-tight">
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
        </motion.div>

        {/* Product Grid / Horizontal Scroll */}
        {loading ? (
          <div className="py-20 text-center font-bold text-gray-400">Loading new arrivals...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-xl font-serif">No products available</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-1 sm:px-2">
              {products.map((product, idx) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Link
                    href={`/product/${product.productId || product.id}`}
                    className={`group bg-[#f5f1ed]/50 hover:bg-white rounded-xl p-4 sm:p-5 transition-all duration-500 shadow-sm hover:shadow-xl border border-transparent hover:border-gray-50 flex-col h-full transform hover:-translate-y-1 cursor-pointer relative flex w-full max-w-[380px] mx-auto`}
                  >
                    {/* Image Area */}
                    <div className="relative w-full h-[220px] sm:h-[260px] rounded-lg overflow-hidden mb-4 bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                      <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
                        <Image
                          src={product.imageUrl || "/img1.png"}
                          alt={product.name}
                          fill
                          className={`object-contain transition-all duration-700 ${imageStates[product.id] ? 'blur-0 scale-100' : 'blur-xl scale-110'}`}
                          onLoadingComplete={() => setImageStates(prev => ({ ...prev, [product.id]: true }))}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-grow">
                      <h4 className="text-base sm:text-lg font-sans text-[var(--color-text-main)] mb-1 line-clamp-1 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                        {product.name}
                      </h4>

                      <div className="flex items-center gap-1 mb-3 text-yellow-400">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[11px] text-gray-400 font-medium ml-1">
                          5.0
                          {(() => {
                            const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
                            const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
                            return <span className="text-gray-300 ml-1">({displayCount})</span>;
                          })()}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-lg sm:text-xl font-bold text-[var(--color-text-main)]">₹{product.price}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product);
                          }}
                          className="p-3 rounded-full bg-white border border-gray-100 text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300 shadow-sm relative z-10"
                        >
                          <ShoppingCart size={18} strokeWidth={2} />
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile View All Button */}
            <motion.div variants={itemVariants} className="mt-10 flex justify-center lg:hidden">
              <Link
                href="/shop"
                className="group flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all bg-white px-8 py-3 rounded-full shadow-sm border border-gray-100 hover:shadow-md"
              >
                View All <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </motion.div>
          </motion.div>
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
