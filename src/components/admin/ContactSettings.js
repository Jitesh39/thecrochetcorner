"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Mail, Phone, MapPin, Instagram, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactSettings() {
  const [data, setData] = useState({
    email: "",
    phone: "",
    address: "",
    instagram: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "contact"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      
      toast.success("Contact settings updated successfully");
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Contact Information</h2>
            <p className="text-sm text-gray-400">Manage the details shown in the footer and contact page.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Update Info
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Mail size={12} className="text-[var(--color-primary)]" /> Email Address
             </label>
             <input 
                type="email" 
                value={data.email} 
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="hello@thecrochetcorner.com"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
             />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Phone size={12} className="text-[var(--color-primary)]" /> Phone Number
             </label>
             <input 
                type="text" 
                value={data.phone} 
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
             />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <MapPin size={12} className="text-[var(--color-primary)]" /> Physical Address
             </label>
             <textarea 
                value={data.address} 
                onChange={(e) => setData({ ...data, address: e.target.value })}
                placeholder="123 Craft Lane, Handmade Street, Art City"
                rows={3}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none resize-none"
             />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Instagram size={12} className="text-[var(--color-primary)]" /> Instagram Handle/URL
             </label>
             <input 
                type="text" 
                value={data.instagram} 
                onChange={(e) => setData({ ...data, instagram: e.target.value })}
                placeholder="@thecrochetcorner"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
