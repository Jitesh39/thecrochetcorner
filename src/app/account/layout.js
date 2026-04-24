"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/account/Sidebar";
import MobileDrawer from "@/components/account/MobileDrawer";
import ScrollToTop from "@/components/admin/ScrollToTop"; // Reuse admin scroll to top
import { Menu, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AccountLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, loading, role } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {pathname !== "/account" && pathname !== "/account/profile" && pathname !== "/account/orders" && <ScrollToTop />}

      {/* Admin Sidebar - only for admins */}
      {role === "admin" && (
        <>
          <div className="fixed top-14 left-0 h-[calc(100vh-56px)] z-40 hidden lg:block">
            <Sidebar />
          </div>
          <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
        </>
      )}

      {/* Main Content Area */}
      <div className={`${role === "admin" ? "lg:pl-[240px]" : ""} transition-all duration-300`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
