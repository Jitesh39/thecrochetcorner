"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Search,
  Heart,
  Star,
  LogOut,
  Package,
  MapPin,
  Settings
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);

  const { user, role } = useAuthStore();
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
        console.error("Error fetching products for search:", error);
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

  // Close suggestions when clicking outside
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
      setIsSearchOpen(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Custom", href: "/custom" },
  ];

  if (!mounted) return null;

  return (
    <header className={`hidden lg:block sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'shadow-md py-2' : 'shadow-sm py-3'}`}>
      <div className="flex justify-center px-4 sm:px-6 lg:px-10">
        <div className="w-full px-6 sm:px-12 lg:px-20 flex justify-between items-center h-14">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-36 sm:h-10 sm:w-44">
                <Image src="/logo1.png" alt="TheCrochetCorner" fill className="object-contain object-left" priority />
              </div>
            </Link>
          </div>

          {/* CENTER: Search (Desktop) */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setShowSuggestions(true);
                }}
                placeholder="Search products..."
                className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
              />
              {searchQuery.trim().length > 0 && showSuggestions && (
                <div
                  ref={searchRef}
                  className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] max-h-[400px] flex flex-col"
                >
                  <div className="overflow-y-auto custom-scrollbar">
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.productId || product.id}`}
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                              <Image src={product.imageUrl || "/img1.png"} alt={product.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-black truncate group-hover:text-[var(--color-primary)] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-[10px] text-black mt-0.5">
                                {product.category || "General"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-[var(--color-primary)]">₹{product.price}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <Search className="text-gray-200" size={40} />
                        <p className="text-sm font-bold text-gray-500">No products found</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Try a different keyword</p>
                      </div>
                    )}
                  </div>

                  {suggestions.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-3 bg-gray-50 border-t border-gray-100 text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] hover:bg-red-50 transition-colors"
                    >
                      View all Products →
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT: Links & Icons */}
          <div className="flex items-center gap-5 mr-3">
            {/* Nav Links (Desktop) */}
            <nav className="flex items-center gap-6 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors hover:text-[var(--color-primary)] ${pathname === link.href ? 'text-[var(--color-primary)]' : 'text-gray-600'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-700 hover:text-[var(--color-primary)] transition-all"
              >
                <Heart size={22} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <button
                onClick={handleProfileClick}
                className="p-2 text-gray-700 hover:text-[var(--color-primary)] transition-all"
              >
                <User size={22} strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <button
                onClick={openDrawer}
                className="relative p-2 text-gray-700 hover:text-[var(--color-primary)] transition-all"
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fecaca; }
      `}</style>
    </header>
  );
}
