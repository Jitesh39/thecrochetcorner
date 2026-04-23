"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ShoppingBag, Search, Loader2, ArrowUpRight, Search as SearchIcon, Truck } from "lucide-react";
import Link from "next/link";

export default function MyOrders() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for Regular Orders
    const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubRegular = onSnapshot(q, (snapshot) => {
      const regularOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isCustom: false }));
      updateCombinedOrders(regularOrders, null);
    }, (err) => {
      console.error("Regular orders error:", err);
      setLoading(false);
    });

    // Listen for Custom Orders
    const cq = query(collection(db, "customOrders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubCustom = onSnapshot(cq, (snapshot) => {
      const customOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isCustom: true }));
      updateCombinedOrders(null, customOrders);
    }, (err) => {
      console.error("Custom orders error:", err);
    });

    const updateCombinedOrders = (newRegular, newCustom) => {
      setOrders(prev => {
        let currentRegular = newRegular || prev.filter(o => !o.isCustom);
        let currentCustom = newCustom || prev.filter(o => o.isCustom);

        const combined = [...currentRegular, ...currentCustom].sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        return combined;
      });
      setLoading(false);
    };

    return () => {
      unsubRegular();
      unsubCustom();
    };
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const orderStatus = order.status || (order.isCustom ? "Pending" : "Processing");
    const matchesFilter = activeFilter === "All" || orderStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-400 font-medium">Track and review all your purchases.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:w-64">
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
            />
            <SearchIcon size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1">
            {["All", "Pending", "Accepted", "Shipped", "Delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeFilter === status
                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 scale-105"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-32 text-center text-gray-300 px-6">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} orders found.</p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex px-8 py-2.5 font-bold">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">
                          {order.orderId || `#${order.id.slice(-6).toUpperCase()}`}
                        </span>
                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.isCustom && !order.items ? (
                        <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                          <ShoppingBag size={20} />
                        </div>
                      ) : (
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items?.map((item, idx) => (
                            <div
                              key={`${order.id}-${item.productId || idx}`}
                              title={item.name}
                              className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 overflow-hidden relative cursor-pointer hover:scale-110 transition-transform z-10 hover:z-20"
                            >
                              <img src={item.image || "/placeholder.png"} alt={item.name} className="object-cover h-full w-full" />
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${order.isCustom ? "text-pink-500" : "text-blue-500"}`}>
                        {order.isCustom ? "Custom Order" : "Store Purchase"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium whitespace-nowrap">
                      {hasMounted && (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Just now")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Delivered" || order.status === "Accepted" || order.status === "Confirmed" ? "bg-green-50 text-green-600" :
                          order.status === "Hold" ? "bg-orange-50 text-orange-600" :
                            "bg-blue-50 text-blue-600"
                        }`}>
                        {order.status || (order.isCustom ? "Pending" : "Processing")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                      ₹{order.isCustom && !order.items ? (order.price || 0) : order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {order.trackingId ? (
                        <div className="flex flex-col items-end gap-1">
                          <a
                            href={`https://shiprocket.co/tracking/${order.trackingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                          >
                            <Truck size={12} /> Track Order
                          </a>
                          <span className="text-[9px] text-gray-400 font-medium tracking-wide">
                            {order.trackingId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px] uppercase font-bold tracking-widest">-</span>
                      )}
                    </td>
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
