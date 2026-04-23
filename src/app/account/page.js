"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import DashboardCards from "@/components/account/DashboardCards";
import { ShoppingBag, Heart, User, ArrowRight, Edit2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    "Total Orders": 0,
    "Pending Orders": 0,
    "Completed Orders": 0,
    "Wishlist Items": 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashData = async () => {
      try {
        // Fetch Orders
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
        const orderSnap = await getDocs(q);
        
        const orders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentOrders(orders);

        // Calculate stats (Mock logic for now, using existing data)
        setStats({
          "Total Orders": orders.length,
          "Pending Orders": orders.filter(o => o.status === "Pending" || o.status === "Processing").length,
          "Completed Orders": orders.filter(o => o.status === "Delivered").length,
          "Wishlist Items": 0 // Wishlist logic required
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();
  }, [user]);

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
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="User" fill className="object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Edit2 size={20} />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800">{user?.displayName || "Member"}</h2>
              <p className="text-sm text-gray-400 font-medium mb-6">{user?.email}</p>
              
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
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
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
