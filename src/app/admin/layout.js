"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import MobileDrawer from "@/components/admin/MobileDrawer";
import ScrollToTop from "@/components/admin/ScrollToTop";
import { Menu, Bell, User, Loader2, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db, auth } from "@/lib/firebase";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

export default function AdminLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, userData, role, loading } = useAuthStore();
  const router = useRouter();

  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    profileImage: "",
    role: "Admin"
  });

  useEffect(() => {
    if (userData) {
      setAdminProfile({
        name: userData.name || user?.displayName || "Admin User",
        profileImage: userData.profileImage || user?.photoURL || "",
        role: "Admin"
      });
    }
  }, [userData, user]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      toast("Signed out");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

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
        <div className="max-w-7xl mx-auto h-full px-6 md:px-10 flex items-center justify-between">
          {/* Left Section: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>

            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-36 sm:h-10 sm:w-44">
                <Image
                  src="/logo1.png"
                  alt="TheCrochetCorner"
                  fill
                  className="object-contain object-left"
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

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 hover:bg-gray-50 p-1.5 rounded-2xl transition-all group active:scale-95"
              >
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-800 tracking-tight">{adminProfile.name}</span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{adminProfile.role}</span>
                </div>
                <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)] font-bold shadow-inner border border-[var(--color-secondary)] relative overflow-hidden">
                  {adminProfile.profileImage ? (
                    <Image src={adminProfile.profileImage} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute top-full mt-3 right-0 w-56 bg-white border border-gray-50 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{adminProfile.name}</p>
                    </div>

                    <Link
                      href="/admin/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all"
                    >
                      <User size={18} />
                      View Profile
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => {
                        setIsProfileOpen(false);
                        // Optional: trigger specific section if needed
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all"
                    >
                      <LayoutDashboard size={18} />
                      Settings
                    </Link>

                    <div className="h-px bg-gray-50 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
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
        <main className="px-4 sm:px-8 pt-0 pb-10 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
