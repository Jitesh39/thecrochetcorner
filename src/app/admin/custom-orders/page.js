"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Heart, CheckCircle2, Clock, AlertCircle, IndianRupee, MessageSquare, Phone, Mail, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const q = query(collection(db, "customOrders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      // Initialize prices state with current order prices
      const initialPrices = {};
      ordersData.forEach(order => {
        initialPrices[order.id] = order.price || 0;
      });
      setPrices(initialPrices);
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching custom orders:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const price = Number(prices[orderId]) || 0;
      await updateDoc(doc(db, "customOrders", orderId), {
        status: newStatus,
        price: price
      });
      alert(`Order updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriceChange = (orderId, value) => {
    setPrices(prev => ({ ...prev, [orderId]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-[var(--color-primary)] mb-4" />
        <p className="text-gray-500 font-medium">Loading custom orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Custom Order Management</h1>
        <p className="text-sm text-gray-400 font-medium">Review and manage personalized order requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <Heart size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No custom orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              layout
              key={order.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Customer & Details */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                          <User size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{order.userName || "Unknown Customer"}</h3>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                            Order ID: {order.orderId || `#${order.id.slice(-6).toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === "accepted" ? "bg-green-50 text-green-600" :
                        order.status === "hold" ? "bg-orange-50 text-orange-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        {order.userEmail || "No email provided"}
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        {order.userPhone || "No phone provided"}
                      </div>
                    </div>
 
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <MessageSquare size={18} className="text-[var(--color-primary)] mt-1" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Requirements / Message</p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {order.message || "No special instructions provided."}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Type</p>
                          <p className="text-sm font-bold text-gray-800">{order.type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Color</p>
                          <p className="text-sm font-bold text-gray-800">{order.color}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Size</p>
                          <p className="text-sm font-bold text-gray-800">{order.size}</p>
                        </div>
                      </div>
                    </div>
                  </div>
 
                  {/* Right Column: Pricing & Actions */}
                  <div className="w-full lg:w-80 bg-[var(--color-secondary)]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 border border-[var(--color-secondary)]">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Assign Price (₹)</label>
                      <div className="relative">
                        <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={prices[order.id]}
                          onChange={(e) => handlePriceChange(order.id, e.target.value)}
                          className="w-full bg-white border border-transparent rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-gray-800 outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
 
                    <div className="space-y-3">
                      <button
                        onClick={() => handleUpdateStatus(order.id, "accepted")}
                        disabled={updatingId === order.id || order.status === "accepted"}
                        className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl shadow-lg border-0 transition-all group ${
                          order.status === "accepted"
                            ? "bg-gray-400 text-white cursor-not-allowed shadow-none"
                            : "btn-primary shadow-[var(--color-primary)]/20"
                        }`}
                      >
                        {updatingId === order.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : order.status === "accepted" ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Accepted</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Accept Order</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "hold")}
                        disabled={updatingId === order.id || order.status === "hold"}
                        className="w-full bg-white text-orange-600 font-bold py-4 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock size={18} />
                        <span>{order.status === "hold" ? "On Hold" : "Put on Hold"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <AlertCircle size={12} />
                      Updating status will also save the current price.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
