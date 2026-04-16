"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import ScrollToTop from "@/components/admin/ScrollToTop"; // Reuse admin scroll to top
import { Menu, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <Sidebar />
      <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
      <ScrollToTop />

      <div className="lg:pl-[240px] transition-all duration-300">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
              <p className="text-xs font-medium text-gray-400">Welcome, {user?.displayName || "Member"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-full transition-all">
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-bold shadow-inner">
                 <User size={20} />
               </div>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
