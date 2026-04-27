"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Clock, 
  Heart,
  Store,
  X,
  LogOut,
  Bell,
  Settings as SettingsIcon
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Manage Products", icon: Package, href: "/admin/products" },
  { name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { name: "Custom Orders", icon: Heart, href: "/admin/custom-orders" },
  { name: "Notifications", icon: Bell, href: "/admin/notifications" },
  { name: "Pending Orders", icon: Clock, href: "/admin/pending" },
  { name: "Settings", icon: SettingsIcon, href: "/admin/settings" },
  { name: "View Store", icon: Store, href: "/#" },
];

export default function MobileDrawer({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      setIsOpen(false);
      toast("Signed out");
      router.push("/login");
    } catch (error) {
      console.error("Logout error: ", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <>
      {/* Overlay & Blur */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside 
        className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          <span className="font-serif text-xl font-bold text-[var(--color-text-main)]">Admin Menu</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href === "/" ? "/#home" : item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-sm border border-[var(--color-primary)]/10" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={22} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-50">
          <button 
             onClick={handleLogout}
             className="w-full py-4 rounded-xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
