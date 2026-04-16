"use client";

import { MapPin, Plus, Home, Briefcase } from "lucide-react";

export default function AddressesPage() {
   return (
      <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
               <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Saved Addresses</h1>
               <p className="text-sm text-gray-400 font-medium">Manage your shipping and billing locations.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
               <Plus size={16} /> Add New Address
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group hover:border-[var(--color-primary)] transition-all">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-xl">
                     <Home size={20} />
                  </div>
                  <span className="font-bold text-gray-800">Home</span>
                  <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-secondary)] px-2 py-1 rounded-full uppercase tracking-widest ml-auto">Default</span>
               </div>

               <div className="space-y-1">
                  <p className="font-bold text-gray-800">John Doe</p>
                  <p className="text-sm text-gray-500">123 Yarn Street, Knit City</p>
                  <p className="text-sm text-gray-500">Woolen State, 110022</p>
                  <p className="text-sm text-gray-500 mt-2">+91 98765 43210</p>
               </div>

               <div className="mt-8 flex items-center gap-4">
                  <button className="text-xs font-bold text-[var(--color-primary)] hover:underline">Edit</button>
                  <button className="text-xs font-bold text-red-400 hover:underline">Remove</button>
               </div>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:bg-white hover:border-[var(--color-primary)] transition-all cursor-pointer min-h-[220px]">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-[var(--color-primary)] transition-all mb-4 shadow-sm">
                  <Plus size={24} />
               </div>
               <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-all">Add another address</p>
            </div>
         </div>
      </div>
   );
}
