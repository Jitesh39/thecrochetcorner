"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function CategorySections() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({
        title: doc.data().name,
        slug: doc.data().slug
      }));
      setDbCategories(catsData);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product);
    if (added) {
      toast.success("Added to wishlist!", { icon: '❤️' });
    } else {
      toast.success("Removed from wishlist");
    }
  };

  // Group products by category
  const categories = dbCategories.map(cat => {
    const slug = cat.slug || cat.title.toLowerCase().replace(/\s+/g, '');
    return {
      title: cat.title,
      slug: slug,
      products: products.filter(p => {
        const productCat = p.category?.toLowerCase().replace(/\s+/g, '') || "";
        return productCat === slug;
      }).slice(0, 5)
    };
  }).filter(cat => cat.products.length > 0);

  return (
    <section className="py-8 sm:py-12 lg:py-24 bg-[#faf9f8] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="text-center mb-10 sm:mb-20 animate-fade-in px-4">
          <span className="text-[var(--color-primary)] font-medium text-[10px] uppercase tracking-[0.4em] mb-4 block">
            BROWSE BY CATEGORY
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--color-text-main)] mb-4 leading-tight">
            Shop By Category
          </h2>
          <div className="h-0.5 w-16 bg-[var(--color-primary)] mx-auto mt-6 opacity-30"></div>
        </div>

        {/* Categories Sections */}
        <div className="space-y-8 sm:space-y-12">
          {loading ? (
            <div className="py-20 text-center font-bold text-gray-400">Loading shop categories...</div>
          ) : categories.map((cat, idx) => (
            <div key={idx} className="animate-slide-up">
              {/* Section Header */}
              <div className="flex justify-between items-end mb-2 sm:mb-3 border-b border-gray-100 pb-2 px-4 sm:px-0">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-main)] transition-colors hover:text-[var(--color-primary)] cursor-default">
                  {cat.title}
                </h3>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all"
                >
                  View All <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>

              {/* Product Grid / Horizontal Scroll */}
              <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 sm:gap-6 no-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory lg:snap-none lg:overflow-visible lg:pb-0">
                {cat.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="min-w-[75%] sm:min-w-[45%] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink group bg-[#f5f1ed]/50 hover:bg-white rounded-[1.5rem] p-4 transition-all duration-500 shadow-sm hover:shadow-2xl border border-transparent hover:border-gray-50 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer relative"
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

                {/* Spacer for end of scroll */}
                <div className="min-w-[1px] lg:hidden pr-4"></div>
              </div>
            </div>
          ))}
        </div>
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
