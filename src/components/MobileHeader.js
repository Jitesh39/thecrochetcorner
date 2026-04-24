"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MobileHeader() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchRef = useRef(null);
  const cartCount = useCartStore((state) => state.getCartCount());
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close search on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showSearch && window.scrollY > 50) {
        setShowSearch(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showSearch]);

  // Fetch all products for live suggestions (On Mount)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(productsData);
      } catch (error) {
        console.error("Error fetching products for mobile search:", error);
      }
    };

    fetchAllProducts();
  }, []);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const filtered = allProducts.filter(product => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const query = debouncedQuery.toLowerCase();
        return name.includes(query) || category.includes(query);
      });
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery, allProducts]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-white z-[100] shadow-sm lg:hidden h-[60px] flex items-center">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* LOGO SIDE */}
        <div className="flex items-center gap-2 ml-3 sm:ml-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo1.png" alt="Logo" width={140} height={32} className="h-7 w-auto object-contain" priority />
          </Link>
        </div>

        {/* RIGHT MENU */}
        <div className="flex items-center gap-4 mr-3 sm:mr-6">
          {/* SEARCH ICON */}
          <button
            onClick={() => setShowSearch(true)}
            className="text-gray-600 p-1 active:scale-90 transition-transform"
          >
            <Search size={22} strokeWidth={2} />
          </button>

          {/* CART */}
          <button
            onClick={openDrawer}
            className="relative text-gray-600 p-1 active:scale-90 transition-transform"
          >
            <ShoppingCart size={22} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SEARCH BAR (TOGGLE SYSTEM) */}
      {showSearch && (
        <div className="fixed top-0 left-0 w-full bg-white z-[110] p-3 shadow-md animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="flex-1 relative search-box">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-10 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all shadow-inner"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  <X size={16} />
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {searchQuery.trim().length > 0 && showSuggestions && (
                <div
                  ref={searchRef}
                  className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[120] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[350px]"
                >
                  <div className="overflow-y-auto no-scrollbar">
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            router.push(`/product/${product.productId || product.id}`);
                            setShowSearch(false);
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-red-50 border-b border-gray-50 last:border-0 cursor-pointer active:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                              <Image src={product.imageUrl || "/img1.png"} alt={product.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-black truncate">{product.name}</h4>
                              <p className="text-[10px] text-black mt-0.5">{product.category || "General"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[var(--color-primary)]">₹{product.price}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <Search className="text-gray-200" size={32} />
                        <p className="text-sm font-bold text-gray-500">No products found</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Try a different keyword</p>
                      </div>
                    )}
                  </div>

                  {suggestions.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-3 bg-gray-50 border-t border-gray-100 text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] active:bg-red-50 transition-colors"
                    >
                      View all  →
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setShowSuggestions(false);
              }}
              className="text-sm font-bold text-[var(--color-primary)] px-2"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
