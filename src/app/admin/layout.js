"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import MobileDrawer from "@/components/admin/MobileDrawer";
import ScrollToTop from "@/components/admin/ScrollToTop";
import { Menu, Bell, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AdminLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, role, loading } = useAuthStore();
  const router = useRouter();

  // Listen for unread notifications
  useEffect(() => {
    if (role !== "admin") return;

    const q = query(collection(db, "notifications"), where("isRead", "==", false));
    const unsub = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsub();
  }, [role]);

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push("/login");
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-[var(--color-primary)] mb-4" />
        <p className="text-gray-500 font-medium font-serif">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Fixed Full-Width Top Navbar */}
      <header className="fixed top-0 left-0 w-full h-16 z-[60] bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-10 flex items-center justify-between relative">
          {/* Left Section: Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
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
            <Link href="/admin/notifications" className="relative p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-full transition-all">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-800 tracking-tight">Admin User</span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Store Manager</span>
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
      <div className="lg:pl-[250px] pt-16 transition-all duration-300">
        <main className="px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
