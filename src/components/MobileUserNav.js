"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Home, ShoppingBag, Sparkles, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function MobileUserNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, role } = useAuthStore();
  const cartCount = useCartStore((state) => state.getCartCount());
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Home", href: "/", icon: Home, highlight: false },
    { name: "Shop", href: "/shop", icon: ShoppingBag, highlight: false },
    { name: "Custom", href: "/custom", icon: Sparkles, highlight: true },
    { name: "Cart", href: "#", icon: ShoppingCart, highlight: false, onClick: openDrawer },
    { name: "Account", href: !user ? "/login" : (role === "admin" ? "/admin" : "/account"), icon: User, highlight: false },
  ];

  if (!mounted) return null;

  return (
    <nav className={`${pathname?.startsWith("/product/") ? "hidden" : "lg:hidden fixed bottom-0"} left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-[100] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`}>
      <div className="flex justify-between items-center px-1 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/home' && pathname === '/');
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              onClick={item.onClick}
              className="flex-1"
            >
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center p-1 group"
              >
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${isActive
                  ? item.highlight
                    ? 'bg-gradient-to-tr from-pink-500 to-[var(--color-primary)] text-white shadow-lg shadow-pink-200 scale-110'
                    : 'text-[var(--color-primary)] scale-110'
                  : item.highlight
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  <Icon
                    size={isActive ? 22 : 20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-all duration-300 ${item.highlight && isActive ? 'animate-pulse' : ''}`}
                  />
                  {item.name === "Cart" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] mt-1 font-bold transition-all duration-300 uppercase tracking-tighter ${isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-gray-500'
                  }`}>
                  {item.name}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
