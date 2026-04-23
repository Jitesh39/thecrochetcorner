"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Search, Heart, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const handleProfileClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  // Need to handle hydration mismatch for Zustand
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    // Fetch all products for live suggestions
    const fetchAllProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(productsData);
      } catch (error) {
        console.error("Error fetching products for search:", error);
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

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const filtered = allProducts.filter(product => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const keywords = product.keywords?.map(k => k.toLowerCase()) || [];
        const query = debouncedQuery.toLowerCase();
        return name.includes(query) || category.includes(query) || keywords.some(k => k.includes(query));
      });
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsExpanded(false);
    }
  }, [debouncedQuery, allProducts]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 5) {
      setIsExpanded(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide main navbar on admin and account pages if needed
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return null;
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Custom Order", href: "/custom" },
    { name: "Contact", href: "/contact" },
  ];

  const displaySuggestions = isExpanded ? suggestions : suggestions.slice(0, 5);

  return (
    <nav
      className={`sticky top-0 w-full z-[100] transition-all duration-500 border-b ${isScrolled || isSearchOpen || isMobileMenuOpen
        ? "bg-white shadow-lg py-2 border-gray-100"
        : "bg-white/90 backdrop-blur-md py-4 border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-44 sm:h-12 sm:w-52 flex items-center">
              <Image src="/logo1.png" alt="TheCrochetCorner" fill className="object-contain object-left" priority />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {!isSearchOpen && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[var(--color-primary)] ${pathname === link.href ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-all active:scale-90"
              aria-label="Toggle search"
            >
              {isSearchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={22} strokeWidth={1.5} />}
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-all active:scale-90 hidden md:block"
              aria-label="Wishlist"
            >
              <Heart size={22} strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleProfileClick}
              className="p-2 text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-all active:scale-90"
              aria-label="Profile"
            >
              <User size={22} strokeWidth={1.5} />
            </button>

            <button
              onClick={openDrawer}
              className="relative p-2 text-[var(--color-text-main)] hover:text-[var(--color-primary)] transition-all active:scale-90 focus:outline-none"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 text-[var(--color-text-main)] active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Search Bar Detail */}
        {isSearchOpen && (
          <div className="absolute left-0 top-full w-full bg-white border-t border-gray-100 py-4 px-4 sm:px-6 lg:px-8 shadow-md transition-all animate-in slide-in-from-top duration-300 search-container">
            <div className="max-w-4xl mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-[var(--color-text-main)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-primary)]/20"
                >
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || searchQuery.trim().length > 0) && (
                <div className={`absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 transition-all duration-300 ${isExpanded ? 'max-h-[70vh] overflow-y-auto' : 'max-h-min'}`}>
                  <div className="p-2">
                    {suggestions.length > 0 ? (
                      <>
                        <div className="space-y-1">
                          {displaySuggestions.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setShowSuggestions(false);
                                setIsExpanded(false);
                              }}
                              className="flex items-center gap-4 p-3 hover:bg-[var(--color-secondary)]/30 rounded-xl transition-all group"
                            >
                              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
                                <Image
                                  src={product.imageUrl || "/img1.png"}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                                  {product.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                  {product.category}
                                </p>
                                <div className="flex text-yellow-400 gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill="currentColor" strokeWidth={0} />
                                  ))}
                                </div>
                              </div>
                              <div className="text-base font-bold text-[var(--color-primary)] tabular-nums">
                                ₹{product.price}
                              </div>
                            </Link>
                          ))}
                        </div>
                        {!isExpanded && suggestions.length > 5 && (
                          <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full flex items-center justify-center gap-2 p-4 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] border-t border-gray-50 mt-2 transition-all group cursor-pointer"
                          >
                            View all {suggestions.length} results
                            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                          </button>
                        )}
                        {isExpanded && (
                          <div className="p-4 text-center text-[10px] text-gray-300 uppercase tracking-widest border-t border-gray-50 mt-2">
                            End of Results
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                          <Search size={32} strokeWidth={1} />
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold text-sm">No products found</p>
                          <p className="text-xs text-gray-400">Try searching for something else</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col space-y-4 border-t border-[var(--color-secondary)]">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-medium px-2 py-2 rounded-xl transition-colors block ${pathname === link.href ? "bg-[var(--color-secondary)] text-[var(--color-primary)]" : "text-[var(--color-text-main)] hover:bg-gray-50"
                  }`}
              >
                {link.name}
              </Link>
              {/* Add Wishlist below Custom Order for mobile */}
              {link.name === "Custom Order" && (
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium px-2 py-2 rounded-xl transition-colors block mt-4 flex items-center gap-2 ${pathname === "/wishlist" ? "bg-[var(--color-secondary)] text-[var(--color-primary)]" : "text-[var(--color-text-main)] hover:bg-gray-50"
                    }`}
                >
                  Wishlist
                  {mounted && wishlistCount > 0 && (
                    <span className="bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
