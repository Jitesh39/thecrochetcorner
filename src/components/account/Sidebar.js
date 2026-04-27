"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  User, 
  MapPin, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuthStore();

  const menuItems = [
    { name: "Account", icon: LayoutDashboard, href: role === "admin" ? "/admin" : "/account" },
    { name: "My Orders", icon: ShoppingBag, href: "/account/orders" },
    { name: "Wishlist", icon: Heart, href: "/account/wishlist" },
    { name: "Profile", icon: User, href: "/account/profile" },
    { name: "Addresses", icon: MapPin, href: "/account/addresses" },
    { name: "Settings", icon: Settings, href: "/account/settings" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // Clear all auth related storage
      toast("Signed out");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-full bg-white border-r border-gray-100 transition-all duration-300 shadow-sm overflow-y-auto">
      <nav className="flex-1 px-4 py-8 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                isActive 
                  ? "bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-[var(--color-primary)]"
              }`}
            >
              <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[var(--color-primary)]" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </aside>
  );
}
