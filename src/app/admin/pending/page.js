"use client";

import { Clock, AlertCircle, ArrowRight } from "lucide-react";

export default function PendingOrdersPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pending Orders</h1>
        <p className="text-sm text-gray-400 font-medium">Orders that require your immediate attention.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {[1, 2, 3, 4].map((i) => (
           <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col gap-4 group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                       <Clock size={18} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">#ORD-PEND-0{i}</span>
                 </div>
                 <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-widest">Urgent</span>
              </div>
              
              <div className="py-2">
                 <p className="text-sm font-medium text-gray-600">Customer Name: <span className="text-gray-800 font-bold">John Doe {i}</span></p>
                 <p className="text-xs text-gray-400 mt-1">Ordered 2 hours ago • ₹3,450</p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                 <button className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                    Process Order <ArrowRight size={14} />
                 </button>
                 <button className="px-4 py-2.5 rounded-xl bg-gray-50 text-gray-400 text-xs font-bold hover:bg-gray-100 transition-all">
                    Details
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Empty State Mockup */}
      <div className="bg-blue-50/50 p-8 rounded-2xl border border-dashed border-blue-200 text-center">
         <AlertCircle className="mx-auto text-blue-400 mb-4" size={32} />
         <h3 className="font-bold text-blue-800">No high-priority alerts</h3>
         <p className="text-sm text-blue-600/70 mt-1">All orders are currently within their processing timeframe.</p>
      </div>
    </div>
  );
}
