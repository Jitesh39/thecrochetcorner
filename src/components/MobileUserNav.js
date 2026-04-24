"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Home, ShoppingBag, Sparkles, Heart, User, X, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MobileUserNav() {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);

  const cartCount = useCartStore((state) => state.getCartCount());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all products for live suggestions
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

    if (isSearchOpen) {
      fetchAllProducts();
    }
  }, [isSearchOpen]);

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

  // Auto-close on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isSearchOpen && window.scrollY > 50) {
        setIsSearchOpen(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearchOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
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
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navItems = [
    { name: "Home", href: "/home", icon: Home, highlight: false },
    { name: "Shop", href: "/shop", icon: ShoppingBag, highlight: false },
    { name: "Custom", href: "/custom", icon: Sparkles, highlight: true },
    { name: "Wishlist", href: "/wishlist", icon: Heart, highlight: false },
    { name: "Account", href: "/account", icon: User, highlight: false },
  ];

  if (!mounted) return null;

  return (
    <>
      <div className="lg:hidden sticky top-0 z-[100] w-full bg-white shadow-sm transition-all duration-300">
        {/* Mobile Header */}
        <header className="w-full py-2 px-4 flex justify-between items-center h-12">
          <Link href="/home" className="flex items-center">
            <div className="relative h-8 w-36 flex items-center">
              <Image src="/logo1.png" alt="TheCrochetCorner" fill className="object-contain object-left" priority />
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 transition-all active:scale-90 ${isSearchOpen ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}
              aria-label="Toggle search"
            >
              {isSearchOpen ? <X size={22} strokeWidth={1.5} /> : <Search size={22} strokeWidth={1.5} />}
            </button>
            <button
              onClick={openDrawer}
              className="relative p-2 text-gray-700 hover:text-[var(--color-primary)] transition-colors active:scale-90"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Expandable Search Bar (Pushes content down) */}
        {isSearchOpen && (
          <div ref={searchRef} className="w-full bg-white px-4 pb-3 border-t border-gray-50 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 mt-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={product.imageUrl || "/img1.png"} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-[var(--color-primary)] font-bold">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className={`${pathname?.startsWith("/product/") ? "hidden" : "lg:hidden fixed bottom-0"} left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-[100] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]`}>
        <div className="flex justify-between items-center px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/home' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center p-1 group"
              >
                <div className={`relative flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 ${isActive
                  ? item.highlight
                    ? 'bg-gradient-to-tr from-pink-500 to-[var(--color-primary)] text-white shadow-lg shadow-pink-200 scale-110'
                    : 'text-[var(--color-primary)] scale-110'
                  : item.highlight
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  <Icon
                    size={isActive ? 22 : 20}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`transition-all duration-300 ${item.highlight && isActive ? 'animate-pulse' : ''}`}
                  />
                  {item.name === "Wishlist" && wishlistCount > 0 && !isActive && (
                    <span className="absolute top-1 right-1 bg-[var(--color-primary)] h-2 w-2 rounded-full border border-white"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${isActive
                  ? 'text-[var(--color-primary)] font-bold'
                  : 'text-gray-500'
                  }`}>
                  {item.name}
                </span>
                {isActive && !item.highlight && (
                  <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] mt-0.5 animate-in zoom-in duration-300" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}
