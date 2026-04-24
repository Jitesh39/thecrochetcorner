"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, onSnapshot, doc } from "firebase/firestore";
import DashboardCards from "@/components/account/DashboardCards";
import {
  ShoppingBag,
  Heart,
  User,
  ArrowRight,
  Edit2,
  MapPin,
  LogOut,
  ChevronRight,
  Package,
  Settings,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

const SidebarItem = ({ label, icon: Icon, href, active, onClick }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${active
      ? "bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold"
      : "hover:bg-gray-50 text-gray-600 font-medium"
      }`}
  >
    {Icon && <Icon size={20} />}
    <span className="text-sm">{label}</span>
  </Link>
);

const MobileItem = ({ label, icon: Icon, href }) => (
  <Link href={href} className="flex justify-between items-center p-4 bg-white active:bg-gray-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
        {Icon && <Icon size={18} />}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </Link>
);

export default function UserDashboard() {
  const { user, role } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState({
    "Total Orders": 0,
    "Pending Orders": 0,
    "Completed Orders": 0,
    "Wishlist Items": 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time User Data
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    const fetchDashData = async () => {
      try {
        // Fetch Orders
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
        const orderSnap = await getDocs(q);

        const orders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentOrders(orders);

        // Calculate stats
        setStats({
          "Total Orders": orders.length,
          "Pending Orders": orders.filter(o => o.status === "Pending" || o.status === "Processing").length,
          "Completed Orders": orders.filter(o => o.status === "Delivered").length,
          "Wishlist Items": 0
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();

    return () => unsubUser();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // ADMIN UI (Existing UI)
  if (role === "admin") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <DashboardCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[var(--color-primary)]/20 to-pink-50"></div>

              <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-full mx-auto p-1 shadow-md mb-4 border border-gray-100 overflow-hidden relative group">
                  <div className="w-full h-full bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)]">
                    {userData?.photoURL ? (
                      <Image src={userData.photoURL} alt="User" fill className="object-cover" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <Link href="/account/profile" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Edit2 size={20} />
                  </Link>
                </div>

                <h2 className="text-xl font-bold text-gray-800">{userData?.name || "Member"}</h2>
                <p className="text-sm text-gray-400 font-medium mb-6">{userData?.email || user?.email}</p>

                <Link
                  href="/account/profile"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-[var(--color-primary)] text-xs font-bold rounded-xl hover:bg-[var(--color-secondary)] transition-all uppercase tracking-widest"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart size={18} className="text-pink-500" /> Wishlist Preview
              </h3>
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400 font-medium italic">Your wishlist is currently empty.</p>
                <Link href="/shop" className="text-xs font-bold text-[var(--color-primary)] mt-4 inline-block hover:underline">Start Shopping</Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[var(--color-primary)]" />
                  <h3 className="font-bold text-gray-800">Recent Orders</h3>
                </div>
                <Link href="/account/orders" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                {recentOrders.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 font-medium px-6">
                    <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-6 py-4 font-bold text-gray-700">#{order.id.slice(-6).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-800">₹{order.totalAmount || "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER UI (Flipkart Style)
  return (
    <div className="animate-in fade-in duration-500">

      {/* DESKTOP UI */}
      <div className="hidden lg:flex gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-[280px] space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] overflow-hidden relative border border-gray-100">
              {userData?.photoURL ? (
                <Image src={userData.photoURL} alt="User" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">Hello,</p>
              <p className="font-bold text-gray-800 truncate">{userData?.name || "Member"}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden py-2">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account Management</p>
            </div>
            <div className="p-2 space-y-1">
              <SidebarItem label="My Orders" icon={Package} href="/account/orders" />
              <SidebarItem label="Addresses" icon={MapPin} href="/account/addresses" />
              <SidebarItem label="Wishlist" icon={Heart} href="/account/wishlist" />
              <SidebarItem label="Profile Settings" icon={User} href="/account/profile" />

              <div className="pt-4 mt-4 border-t border-gray-50 px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 font-bold hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px]">
            {/* Dashboard View */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Overview</h2>
              <DashboardCards stats={stats} />
            </div>

            <div className="border-t border-gray-50 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                <Link href="/account/orders" className="text-xs font-bold text-[var(--color-primary)] hover:underline">View All</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3 text-[var(--color-primary)]">
                    <Package size={20} />
                    <span className="font-bold text-sm">Recent Order</span>
                  </div>
                  {recentOrders.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-gray-800">#{recentOrders[0].id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{recentOrders[0].status}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No orders yet</p>
                  )}
                </div>
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3 text-pink-500">
                    <Heart size={20} />
                    <span className="font-bold text-sm">Wishlist</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">Explore your favorites</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE UI */}
      <div className="lg:hidden space-y-4">
        {/* TOP PROFILE CARD */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] overflow-hidden relative border-2 border-white shadow-sm">
              {userData?.photoURL ? (
                <Image src={userData.photoURL} alt="User" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]">
                  <User size={32} />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800 leading-tight">{userData?.name || "Member"}</p>
              <p className="text-xs text-gray-500 mt-1">{userData?.email || user?.email}</p>
              {(userData?.phone || user?.phoneNumber) && <p className="text-xs text-gray-500">{userData?.phone || user?.phoneNumber}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 1: ORDERS & WISHLIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MobileItem label="My Orders" icon={Package} href="/account/orders" />
          <MobileItem label="Wishlist" icon={Heart} href="/account/wishlist" />
        </div>

        {/* SECTION 2: ACCOUNT SETTINGS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MobileItem label="Edit Profile" icon={User} href="/account/profile" />
          <MobileItem label="Saved Address" icon={MapPin} href="/account/addresses" />
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 text-red-500 font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
