"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
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

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { name: "Wishlist", icon: Heart, href: "/dashboard/wishlist" },
  { name: "Profile", icon: User, href: "/dashboard/profile" },
  { name: "Addresses", icon: MapPin, href: "/dashboard/addresses" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-40 transition-all duration-300 shadow-sm">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="font-serif text-xl font-bold text-[var(--color-text-main)]">My Corner</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
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
