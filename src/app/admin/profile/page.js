"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { User, Mail, Phone, Calendar, Shield, Edit, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

export default function AdminProfilePage() {
  const { userData, user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const adminData = {
    name: userData?.name || user?.displayName || "Admin User",
    email: userData?.email || user?.email || "admin@thecrochetcorner.com",
    phone: userData?.phone || "Not provided",
    profileImage: userData?.profileImage || user?.photoURL || "",
    updatedAt: userData?.updatedAt || null
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Profile</h1>
            <p className="text-sm text-gray-400 font-medium">Your account overview and details.</p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shadow-sm active:scale-95"
        >
          <Edit size={18} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Card with Image */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 text-center flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[var(--color-secondary)] mb-6 shadow-xl">
              {adminData.profileImage ? (
                <Image src={adminData.profileImage} alt={adminData.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <User size={64} strokeWidth={1} />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">{adminData.name}</h2>
            <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-secondary)] px-4 py-1.5 rounded-full mb-6">Store Administrator</p>

            <div className="w-full pt-6 border-t border-gray-50 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Access Level</p>
                  <p className="text-xs font-bold text-gray-700">Full Control</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Last Updated</p>
                  <p className="text-xs font-bold text-gray-700">
                    {adminData.updatedAt ? new Date(adminData.updatedAt.toMillis()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="font-bold text-gray-800">Account Information</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Full Name</p>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <User size={16} className="text-gray-300" />
                  {adminData.name}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Email Address</p>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Mail size={16} className="text-gray-300" />
                  {adminData.email}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Phone Number</p>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Phone size={16} className="text-gray-300" />
                  {adminData.phone}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Store Role</p>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Shield size={16} className="text-gray-300" />
                  Administrator
                </div>
              </div>
            </div>
          </div>

          {/* Activity/Security Placeholder */}
          <div className="bg-[var(--color-secondary)]/30 rounded-[2rem] p-8 border border-[var(--color-secondary)]">
            <h4 className="font-bold text-[var(--color-primary)] mb-2">Security Notice</h4>
            <p className="text-xs text-[var(--color-primary)]/70 leading-relaxed font-medium">
              You are currently logged in as the primary store administrator. To maintain security, ensure your profile details are accurate and logout when using public devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
