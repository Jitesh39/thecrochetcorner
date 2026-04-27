import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, limit, query } from "firebase/firestore";
import { motion } from "framer-motion";

// Optimized Skeleton Component - Matches EXACT dimensions
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full w-full max-w-[380px] mx-auto animate-pulse">
    <div className="w-full h-[260px] sm:h-[300px] bg-gray-100" />
    <div className="p-4 sm:p-5 flex flex-col flex-grow">
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-6 bg-gray-100 rounded w-1/4 mb-4" />
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="mt-auto w-full h-12 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

// Memoized Product Card to prevent unnecessary re-renders
const ProductCard = memo(({ product, addItem, imageStates, setImageStates, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/product/${product.productId || product.id}`}
        className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer relative w-full max-w-[380px] mx-auto"
      >
        {/* Product Image Area */}
        <div className="relative w-full h-[260px] sm:h-[300px] bg-gray-50 flex items-center justify-center overflow-hidden">
          <span className="absolute top-4 left-4 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10 shadow-sm">
            {product.category || "Best Item"}
          </span>

          <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
            <Image
              src={product.imageUrl || "/img1.png"}
              alt={product.name}
              fill
              loading="lazy"
              className={`object-contain transition-all duration-700 ${imageStates[product.id] ? 'blur-0 scale-100' : 'blur-xl scale-110'}`}
              onLoadingComplete={() => setImageStates(prev => ({ ...prev, [product.id]: true }))}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <div className="flex flex-col mb-3">
            <h3 className="text-base sm:text-lg font-sans text-[var(--color-text-main)] leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
            <p className="text-lg font-bold text-[var(--color-primary)]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < 5 ? "currentColor" : "none"}
                  className={i < 5 ? "" : "text-gray-200"}
                />
              ))}
            </div>
            {(() => {
              const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
              const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
              return <span className="text-[11px] text-gray-400 font-medium ml-1">({displayCount})</span>;
            })()}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
            }}
            className="mt-auto w-full flex items-center justify-center gap-3 border border-gray-100 py-3 rounded-xl text-sm text-[var(--color-text-main)] font-bold transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] shadow-sm relative z-10"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageStates, setImageStates] = useState({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const q = query(collection(db, "products"), limit(6));
    const unsub = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });

    return () => unsub();
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
    <section className="w-full px-6 sm:px-12 lg:px-20 py-4 sm:py-8 bg-[#f5f1ed]">
      <div className="w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-serif text-[var(--color-text-main)] mb-3 font-medium">
            Bestselling Products
          </h2>
          <div className="h-1 w-20 bg-[var(--color-primary)] mx-auto rounded-full"></div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1 sm:px-2"
        >
          {loading ? (
            // Show 6 skeletons matching the exact dimensions
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addItem={addItem}
              imageStates={imageStates}
              setImageStates={setImageStates}
              itemVariants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

