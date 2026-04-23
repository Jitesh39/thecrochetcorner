"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { ShoppingBag, Search, Filter, Printer, CheckCircle, Clock, Search as SearchIcon, Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [shippingId, setShippingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=650');
    if (!printWindow) return;

    const tableRows = orders.map(order => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.customerName || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.customerEmail || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.items?.map(i => i.name).join(', ') || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.items?.map(i => i.quantity).join(', ') || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">₹${order.totalAmount?.toLocaleString() || 0}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.status || 'Pending'}</td>
        <td style="border: 1px solid #ddd; padding: 10px;">${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Orders Report - The Crochet Corner</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #a31d1d; padding-bottom: 20px; }
            .logo { color: #a31d1d; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 12px 10px; text-align: left; font-size: 13px; text-transform: uppercase; color: #666; }
            h2 { margin-bottom: 10px; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">The Crochet Corner</div>
            <h2>Orders Report</h2>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Products</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Crochet Corner. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Accepted"
      });
      toast.success("Order accepted");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShipOrder = async (orderId) => {
    setShippingId(orderId);
    try {
      const res = await fetch("/api/ship-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId, userId: user?.uid })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create shipment");
      }
      
      toast.success("Shipment created! Tracking ID: " + data.trackingId);
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error(error.message || "Failed to create shipment.");
    } finally {
      setShippingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === "All" || (order.status || "Pending") === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Order Management</h1>
          <p className="text-sm text-gray-400 font-medium">Track and process customer purchases in real-time.</p>
        </div>
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm self-start sm:self-auto"
        >
          <Printer size={16} /> Print Orders
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search order ID or customer..."
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
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-32 text-center text-gray-300">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Just now"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{order.customerName}</span>
                        <span className="text-[10px] text-gray-400">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.map((item, idx) => (
                          <Link
                            key={idx}
                            href={`/product/${item.id}`}
                            title={item.name}
                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 overflow-hidden relative cursor-pointer hover:scale-110 transition-transform z-10 hover:z-20"
                          >
                            <img src={item.image || "/placeholder.png"} alt={item.name} className="object-cover h-full w-full" />
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Accepted" || order.status === "Delivered" ? "bg-green-50 text-green-600" :
                        order.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                          "bg-orange-50 text-orange-600"
                        }`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {order.status === "Pending" || !order.status ? (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={updatingId === order.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-50 hover:shadow-md active:scale-95"
                        >
                          {updatingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Accept</>}
                        </button>
                      ) : order.status === "Accepted" ? (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          disabled={shippingId === order.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 hover:shadow-md active:scale-95"
                        >
                          {shippingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <><Truck size={12} /> Ship Order</>}
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                            <CheckCircle size={12} /> {order.status === "Delivered" ? "Delivered" : "Processed"}
                          </div>
                          {order.trackingId && (
                            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                              {order.courier ? `${order.courier}: ` : ''}{order.trackingId}
                            </span>
                          )}
                        </div>
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
