"use client";

import { useAuthStore } from "@/store/authStore";
import { User, Mail, Shield, Camera, Save } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">My Profile</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-medium">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center lg:sticky lg:top-24">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)] text-2xl font-bold border-4 border-white shadow-sm">
                  {user?.displayName ? user.displayName[0] : <User size={32} />}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white shadow-md border border-gray-100 rounded-full text-gray-400 hover:text-[var(--color-primary)] transition-all active:scale-90">
                  <Camera size={14} />
                </button>
              </div>
              <h3 className="font-bold text-gray-800">{user?.displayName || "Member"}</h3>
              <p className="text-xs text-gray-400 mb-6">{user?.email}</p>
              
              <div className="pt-6 border-t border-gray-50 flex items-center justify-center gap-6">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Joined</p>
                   <p className="text-xs font-bold text-gray-700">Oct 2023</p>
                </div>
                <div className="w-px h-6 bg-gray-50"></div>
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Status</p>
                   <p className="text-xs font-bold text-green-500">Active</p>
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-sm sm:text-base">
                 <Shield size={18} className="text-blue-500" /> Account Security
              </h3>
              
              <form className="space-y-5">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Display Name</label>
                       <div className="relative">
                          <input type="text" defaultValue={user?.displayName} className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" />
                          <User size={16} className="absolute left-3.5 top-2.5 text-gray-300" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                       <div className="relative">
                          <input type="email" defaultValue={user?.email} disabled className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 px-4 pl-10 text-sm outline-none cursor-not-allowed text-gray-400" />
                          <Mail size={16} className="absolute left-3.5 top-2.5 text-gray-300" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
                       <Save size={18} /> Save Changes
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}
