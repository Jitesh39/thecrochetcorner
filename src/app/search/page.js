"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(product => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const keywords = product.keywords?.map(k => k.toLowerCase()) || [];
        return name.includes(lowerQuery) || category.includes(lowerQuery) || keywords.some(k => k.includes(lowerQuery));
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [query, products]);

  return (
    <div className="bg-[#fcfbf9] min-h-screen pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--color-secondary)] rounded-2xl mb-6 text-[var(--color-primary)]">
            <Search size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-4">
            {query ? `Search results for "${query}"` : "All Products"}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Found {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-gray-400">Searching our collection...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-full transform hover:-translate-y-2"
              >
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={product.imageUrl || "/img1.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.category && (
                    <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  )}
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-serif font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <span className="text-xl font-bold text-[var(--color-text-main)]">₹{product.price}</span>
                    <button
                      onClick={() => addItem(product)}
                      className="p-3 bg-[var(--color-primary)] text-white rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 hover:scale-110 active:scale-90 transition-all"
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 max-w-2xl mx-auto px-6">
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">No products found</h2>
            <p className="text-gray-500 mb-8">We couldn't find anything matching your search. Try different keywords or browse our categories.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--color-primary)]/20"
            >
              Back to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
