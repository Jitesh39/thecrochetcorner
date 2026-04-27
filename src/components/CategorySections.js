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
import { ShoppingBag } from "lucide-react";

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
        {/* Main Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-14 px-4"
        >
          <span className="text-[var(--color-primary)] font-medium text-[10px] uppercase tracking-[0.4em] mb-4 block">
            BROWSE BY CATEGORY
          </span>
          <h2 className="text-2xl md:text-5xl font-serif font-medium text-[var(--color-text-main)] mb-4 leading-tight">
            Shop By Category
          </h2>
          <div className="h-0.5 w-16 bg-[var(--color-primary)] mx-auto mt-6 opacity-30"></div>
        </motion.div>

        {/* Categories Sections */}
        <div className="space-y-12 sm:space-y-20">
          {loading ? (
            <div className="py-20 text-center font-bold text-gray-400">Loading shop categories...</div>
          ) : categories.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {/* Section Header */}
              <motion.div 
                variants={itemVariants}
                className="flex justify-between items-end mb-4 sm:mb-6 border-b border-gray-100 pb-2"
              >
                <h3 className="text-xl md:text-3xl font-serif font-medium text-[var(--color-text-main)] transition-colors hover:text-[var(--color-primary)] cursor-default">
                  {cat.title}
                </h3>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all"
                >
                  View All <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              </motion.div>

              {/* Product Grid - Exactly 5 items on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 px-1 sm:px-2">
                {cat.products.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <Link
                      href={`/product/${product.productId || product.id}`}
                      className="group bg-[#f5f1ed]/50 hover:bg-white rounded-xl p-3 sm:p-5 transition-all duration-500 shadow-sm hover:shadow-xl border border-transparent hover:border-gray-50 flex flex-col h-full"
                    >
                      {/* Image Area */}
                      <div className="relative w-full h-[130px] sm:h-[240px] rounded-lg overflow-hidden mb-3 bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                        <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
                          <Image
                            src={product.imageUrl || "/img1.png"}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-grow">
                        <h4 className="text-sm sm:text-base font-sans text-[var(--color-text-main)] mb-1 line-clamp-1 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                          {product.name}
                        </h4>

                        <div className="flex items-center gap-1 mb-2 text-yellow-400">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] text-gray-400 font-medium ml-1">
                            5.0
                          </span>
                        </div>

                        <div className="mt-auto flex flex-col gap-2">
                          <span className="text-sm sm:text-lg font-bold text-[var(--color-text-main)]">₹{product.price}</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem(product);
                            }}
                            className="w-[90%] mx-auto mt-1 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold border border-gray-200 py-1.5 rounded-xl hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all"
                          >
                            <ShoppingBag size={18} strokeWidth={2.5} />
                            Add to Cart
                          </motion.button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar,
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar,
        .scrollbar-hide {
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
