"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import DashboardCards from "@/components/admin/DashboardCards";
import { ShoppingBag, TrendingUp, Users, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time Products Count
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
    });

    // Real-time Orders and Calculations
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const total = snapshot.size;
      const pending = ordersData.filter(o => o.status === "Pending" || o.status === "Processing").length;
      const revenue = ordersData.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

      setStats(prev => ({
        ...prev,
        totalOrders: total,
        pendingOrders: pending,
        revenue: revenue
      }));

      // Update Recent Orders table (last 5)
      const sortedOrders = [...ordersData]
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        .slice(0, 5);
      setRecentOrders(sortedOrders);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 font-medium">Welcome back to your store's control center.</p>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[var(--color-primary)]" />
                <h3 className="font-bold text-gray-800">Recent Orders</h3>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-200" size={32} /></div>
              ) : recentOrders.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-medium px-6">No orders placed yet.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 font-bold text-gray-700">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)]">
                              {order.customerName ? order.customerName[0] : "C"}
                            </div>
                            <span className="text-gray-600 font-medium">{order.customerName || "Customer"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                            }`}>
                            {order.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">₹{order.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column - Insights */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-green-500" />
              <h3 className="font-bold text-gray-800">Growth Insights</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Live Inventory</p>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">You have {stats.totalProducts} active products in your store gallery.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Active Orders</p>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">There are {stats.totalOrders} total orders recorded in the system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
