"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ShoppingBag, Loader2, Package, Truck, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function MyOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen for Regular Orders
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 size={32} className="animate-spin mb-4 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <Link
          href="/account"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100 shadow-sm sm:hidden"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your recent purchases</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              Looks like you haven't placed any orders yet. Start exploring our handmade collection!
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <Package size={16} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                      <p className="text-sm font-bold text-gray-700">#{order.orderId || order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-gray-700">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "Delivered" ? "bg-green-50 text-green-600" :
                        order.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                          "bg-orange-50 text-orange-600"
                      }`}>
                      {order.status || "Processing"}
                    </span>
                  </div>
                </div>

                {/* Product Items */}
                <div className="p-6 divide-y divide-gray-50">
                  {order.items?.map((item, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || item.imageUrl || "/img1.png"}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">{item.name}</h4>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-[var(--color-primary)]">₹{item.price?.toLocaleString()}</p>
                          <span className="text-gray-300">|</span>
                          <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity || 1}</p>
                        </div>
                        {item.isCustom && (
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{item.color}</span>
                            <span className="text-[9px] bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{item.size}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="px-6 py-6 bg-gray-50/30 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                      {order.address || order.shippingAddress?.address || "Address not specified"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivered On</p>
                      <p className="text-xs text-gray-600 font-bold">
                        {order.deliveredDate || (order.status === "Delivered" ? "Delivered" : "Expected in 5-7 days")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                      <p className="text-xs text-gray-600 font-bold uppercase">{order.paymentMethod || "Online Payment"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end md:col-span-2 lg:col-span-1">
                    {order.trackingId ? (
                      <a
                        href={`https://shiprocket.co/tracking/${order.trackingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                      >
                        <Truck size={14} /> Track Order
                      </a>
                    ) : (
                      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                        Processing Details
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
