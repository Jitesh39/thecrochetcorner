"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { User, MessageSquare, Plus, Trash2, Save, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function HappyCustomersSettings() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "testimonials"), (docSnap) => {
      if (docSnap.exists()) {
        setEntries(docSnap.data().entries || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = () => {
    setEntries([...entries, { name: "", product: "", text: "", rating: 5 }]);
  };

  const handleRemove = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "testimonials"), { entries }, { merge: true });
      toast.success("Feedback saved successfully");
    } catch (err) {
      toast.error("Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Star size={20} className="text-yellow-400" />
              Customer Feedback
            </h2>
            <p className="text-sm text-gray-400">Add or manage customer reviews displayed on the homepage.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
                <Plus size={14} /> Add Entry
             </button>
             <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Save All
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry, idx) => (
            <div key={idx} className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-4 relative group">
              <button 
                onClick={() => handleRemove(idx)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <User size={10} /> Name
                   </label>
                   <input 
                      type="text" 
                      value={entry.name} 
                      onChange={(e) => handleChange(idx, "name", e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-transparent rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none transition-all shadow-sm"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Star size={10} /> Rating
                   </label>
                   <select 
                      value={entry.rating} 
                      onChange={(e) => handleChange(idx, "rating", Number(e.target.value))}
                      className="w-full bg-white border border-transparent rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                   >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                   <MessageSquare size={10} /> Review Text
                </label>
                <textarea 
                  value={entry.text} 
                  onChange={(e) => handleChange(idx, "text", e.target.value)}
                  placeholder="What did they say?"
                  rows={3}
                  className="w-full bg-white border border-transparent rounded-xl p-4 text-sm focus:border-[var(--color-primary)] outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="col-span-full py-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
               <MessageSquare size={48} strokeWidth={1} />
               <p className="text-xs font-bold uppercase tracking-widest mt-4">No testimonials yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
