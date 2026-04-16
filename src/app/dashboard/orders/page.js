"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ShoppingBag, Search, Filter, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function MyOrders() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-400 font-medium">Track and review all your purchases.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full bg-gray-50 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["All", "Processing", "Shipped", "Delivered"].map((status) => (
              <button key={status} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${status === "All" ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-32 text-center text-gray-300">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">No orders found.</p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex px-8 py-2.5 font-bold">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">#{order.id.slice(-6).toUpperCase()}</span>
                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Pending"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                        }`}>
                        {order.status || "Processing"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">₹{order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
