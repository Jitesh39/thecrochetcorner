"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { ShoppingBag, Search, Filter, Download, CheckCircle, Clock, Search as SearchIcon, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Order Management</h1>
          <p className="text-sm text-gray-400 font-medium">Track and process customer purchases in real-time.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
           <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
         <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
               <input 
                  type="text" 
                  placeholder="Search order ID or customer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" 
               />
               <SearchIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
               {["All", "Pending", "Accepted", "Shipped", "Delivered"].map((status) => (
                 <button key={status} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                   status === "All" ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                 }`}>
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
             <p>No orders found.</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
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
                     <td className="px-6 py-4">
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
                         {order.items?.slice(0, 3).map((item, idx) => (
                           <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 overflow-hidden relative">
                             <img src={item.image || "/placeholder.png"} alt={item.name} className="object-cover h-full w-full" />
                           </div>
                         ))}
                         {order.items?.length > 3 && (
                           <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 items-center justify-center text-[10px] font-bold text-gray-500">
                             +{order.items.length - 3}
                           </div>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          order.status === "Accepted" || order.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {order.status || "Pending"}
                        </span>
                     </td>
                     <td className="px-6 py-4 font-bold text-gray-800">₹{order.totalAmount?.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right whitespace-nowrap">
                       {order.status === "Pending" ? (
                         <button 
                           onClick={() => handleAcceptOrder(order.id)}
                           disabled={updatingId === order.id}
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-50"
                         >
                           {updatingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Accept</>}
                         </button>
                       ) : (
                         <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-default">
                           <CheckCircle size={12} /> Accepted
                         </button>
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
