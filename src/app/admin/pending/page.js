"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Only fetch orders where status is "Pending" (or "pending")
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["Pending", "pending"])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let pendingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort manually to avoid requiring a composite index in Firestore
      pendingData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setOrders(pendingData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending orders:", error);
      toast.error("Failed to fetch pending orders");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " min ago" : " mins ago");
    return "Just now";
  };

  const handleProcessOrder = async (orderId) => {
    // Prevent double processing
    if (processingId === orderId) return;
    
    setProcessingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      
      // Optimistic status update (optional but good for UX)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Accepted" } : o));

      await updateDoc(orderRef, {
        status: "Accepted"
      });
      toast.success("Order accepted and moved to main orders list.");
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to process order.");
      // Rollback on error
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Pending" } : o));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pending Orders</h1>
          <p className="text-sm text-gray-400 font-medium">Orders that require your immediate attention.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="space-y-2 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pending Orders</h1>
        <p className="text-sm text-gray-400 font-medium">Orders that require your immediate attention.</p>
      </div>

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col gap-4 group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">#{(order.orderId || order.id).slice(-6).toUpperCase()}</span>
                </div>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-widest">Urgent</span>
              </div>

              <div className="py-2">
                <p className="text-sm font-medium text-gray-600">Customer Name: <span className="text-gray-800 font-bold">{order.customerName || "Customer"}</span></p>
                <p className="text-xs text-gray-400 mt-1">Ordered {getTimeAgo(order.createdAt)} • ₹{(order.amount || order.totalAmount || 0).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleProcessOrder(order.id)}
                  disabled={processingId === order.id || order.status === "Accepted"}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    order.status === "Accepted"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                  }`}
                >
                  {processingId === order.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : order.status === "Accepted" ? (
                    "Accepted"
                  ) : (
                    <>Process Order <ArrowRight size={14} /></>
                  )}
                </button>
                <button
                  onClick={() => router.push("/admin/orders")}
                  className="px-4 py-2.5 rounded-xl bg-gray-50 text-gray-400 text-xs font-bold hover:bg-gray-100 transition-all"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50/50 p-8 rounded-2xl border border-dashed border-green-200 text-center">
          <AlertCircle className="mx-auto text-green-400 mb-4" size={32} />
          <h3 className="font-bold text-green-800 text-lg">No pending orders 🎉</h3>
          <p className="text-sm text-green-600/70 mt-1">All orders are currently processed.</p>
        </div>
      )}
    </div>
  );
}
