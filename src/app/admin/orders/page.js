"use client";

import { ShoppingBag, Search, Filter, Download } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Order History</h1>
          <p className="text-sm text-gray-400 font-medium">Manage and track all customer orders from one place.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
           <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:flex-initial">
                  <input 
                     type="text" 
                     placeholder="Search orders..." 
                     className="w-full md:w-64 bg-gray-50 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" 
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
               </div>
               <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[var(--color-primary)] transition-all">
                  <Filter size={18} />
               </button>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
               {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                 <button key={status} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                   status === "All" ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                 }`}>
                   {status}
                 </button>
               ))}
            </div>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
               <tr>
                 <th className="px-6 py-4">Order ID</th>
                 <th className="px-6 py-4">Customer</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Amount</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                   <td className="px-6 py-4 font-bold text-gray-700">#ORD-998{i}</td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <span className="text-gray-600 font-medium font-bold">Customer {i}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-gray-400 font-medium">Oct {20-i}, 2023</td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        i % 3 === 0 ? "bg-green-50 text-green-600" : i % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {i % 3 === 0 ? "Delivered" : i % 3 === 1 ? "Processing" : "Shipped"}
                      </span>
                   </td>
                   <td className="px-6 py-4 text-right font-bold text-gray-800">₹2,499</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
