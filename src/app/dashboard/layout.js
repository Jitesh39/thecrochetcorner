"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import ScrollToTop from "@/components/admin/ScrollToTop"; // Reuse admin scroll to top
import { Menu, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Fixed Full-Width Top Navbar */}
      <header className="fixed top-0 left-0 w-full h-16 z-[60] bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-10 flex items-center justify-between relative">
          {/* Left Section: Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              suppressHydrationWarning
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Center Section: Logo (Tuned slightly left) */}
          <div className="absolute left-[47%] -translate-x-1/2 flex items-center pointer-events-none sm:pointer-events-auto">
            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-36 sm:h-10 sm:w-44">
                <Image
                  src="/logo1.png"
                  alt="TheCrochetCorner"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right Section: Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              suppressHydrationWarning
              className="hidden sm:flex p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-full transition-all"
            >
              <Bell size={20} />
            </button>

            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-800 tracking-tight">
                  {hasMounted ? (user?.displayName || "Member") : "..."}
                </span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Customer</span>
              </div>
              <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-bold shadow-inner border border-[var(--color-secondary)]">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Sidebar below Header */}
      <div className="fixed top-16 left-0 h-[calc(100vh-64px)] z-50">
        <Sidebar />
      </div>

      <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
      <ScrollToTop />

      {/* Main Content Area - Offset by header and sidebar */}
      <div className="lg:pl-[240px] pt-16 transition-all duration-300">
        <main className="px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
