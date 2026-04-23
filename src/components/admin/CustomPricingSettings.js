"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { IndianRupee, Package, Maximize2, Palette, Save, Loader2, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomPricingSettings() {
  const [pricing, setPricing] = useState({
    basePrice: {
      bouquet: 0,
      keychain: 0,
      hairband: 0,
      accessories: 0,
      decor: 0,
      other: 0
    },
    size: {
      small: 0,
      medium: 0,
      large: 0
    },
    color: {
      normal: 0,
      premium: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "customPricing"), (docSnap) => {
      if (docSnap.exists()) {
        setPricing(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "customPricing"), {
        ...pricing,
        updatedAt: serverTimestamp()
      });
      toast.success("Pricing updated successfully!");
    } catch (err) {
      toast.error("Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (category, field, value) => {
    const numValue = Math.max(0, Number(value) || 0);
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }));
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Base Prices */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-gray-800 font-bold border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Package size={18} /></div>
            Base Prices
          </div>
          <div className="space-y-4">
            {Object.keys(pricing.basePrice).map((type) => (
              <div key={type} className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{type}</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={pricing.basePrice[type]}
                    onChange={(e) => updateNested("basePrice", type, e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Modifiers */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-gray-800 font-bold border-b border-gray-50 pb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Maximize2 size={18} /></div>
            Size Modifiers
          </div>
          <div className="space-y-4">
            {Object.keys(pricing.size).map((size) => (
              <div key={size} className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{size}</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={pricing.size[size]}
                    onChange={(e) => updateNested("size", size, e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                  />
                </div>
              </div>
            ))}
            <div className="p-4 bg-orange-50 rounded-2xl text-[10px] text-orange-600 font-medium leading-relaxed mt-4">
              <Info size={12} className="inline mr-1 mb-0.5" />
              Size prices are added to the base price. Keep 'Small' as 0 if it's the standard size.
            </div>
          </div>
        </div>

        {/* Color Modifiers */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-gray-800 font-bold border-b border-gray-50 pb-4">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Palette size={18} /></div>
            Color Modifiers
          </div>
          <div className="space-y-4">
            {Object.keys(pricing.color).map((color) => (
              <div key={color} className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{color}</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={pricing.color[color]}
                    onChange={(e) => updateNested("color", color, e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Save Pricing Settings
      </button>
    </div>
  );
}
