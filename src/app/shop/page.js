"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, ShoppingBag, ChevronDown, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectedCategory = searchParams.get("category")?.toLowerCase() || "all";
  const [sortBy, setSortBy] = useState("Featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

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
        name: doc.data().name,
        slug: doc.data().slug || doc.data().name.toLowerCase().replace(/\s+/g, '')
      }));
      setDbCategories(catsData);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const categories = [{ name: "All", slug: "all" }, ...dbCategories];
  const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low"];

  const handleCategoryClick = (slug) => {
    if (slug === "all") {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const productCat = p.category?.toLowerCase().replace(/\s+/g, '') || "";
      return selectedCategory === "all" || productCat === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return (a.price || 0) - (b.price || 0);
      if (sortBy === "Price: High to Low") return (b.price || 0) - (a.price || 0);
      return 0; // Featured
    });

  return (
    <div className="bg-[#fcfbf9] min-h-screen pt-0 lg:pt-6 pb-8 sm:pb-16">
      <div className="w-full px-3 sm:px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-3">Our Collection</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-xl mx-auto italic px-4">Each piece is handcrafted with premium yarn and hours of careful stitching</p>
        </div>

        {/* Filters and Sort Row */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-2 lg:pb-0 px-1 sm:px-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border ${selectedCategory === cat.slug
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                  : "bg-white text-gray-500 border-gray-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shadow-sm"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 lg:w-56 px-2">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:border-gray-200 transition-all shadow-sm"
            >
              <span className="text-gray-400 mr-2 font-medium text-xs uppercase tracking-wider">Sort:</span>
              <span className="flex-grow text-left">{sortBy}</span>
              <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full mt-2 left-2 right-2 bg-white border border-gray-50 rounded-xl shadow-xl z-[40] py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setIsSortOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${sortBy === opt ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {opt}
                    {sortBy === opt && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-1 sm:px-2">
          {loading ? (
            <div className="col-span-full py-20 text-center font-bold text-gray-400">Loading collection...</div>
          ) : filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-50/50 cursor-pointer relative w-full max-w-[380px] mx-auto"
            >
              <div className="relative w-full h-[260px] sm:h-[300px] bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.category && (
                  <span className="absolute top-4 left-4 z-10 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    {product.category}
                  </span>
                )}
                <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
                  <Image src={product.imageUrl || "/img1.png"} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <div className="flex flex-col mb-3">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--color-text-main)] leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-lg font-bold text-[var(--color-primary)]">₹{product.price}</p>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  {(() => {
                    const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
                    const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
                    return <span className="text-[11px] text-gray-400 font-medium ml-1">({displayCount})</span>;
                  })()}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem(product);
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-3 border border-gray-100 py-3 rounded-xl text-sm text-[var(--color-text-main)] font-bold transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] shadow-sm relative z-10"
                >
                  <ShoppingBag size={18} strokeWidth={2.5} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-10 sm:py-12 lg:py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-2xl font-serif text-gray-300">No products found in this category.</p>
            <button onClick={() => handleCategoryClick("all")} className="mt-6 text-[var(--color-primary)] font-bold underline underline-offset-4">View All Collection</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
