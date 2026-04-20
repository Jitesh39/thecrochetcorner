"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ImageIcon, Trash2, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function CustomOrderSettings() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "customOrder"), (docSnap) => {
      if (docSnap.exists()) {
        setImages(docSnap.data().images || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setUploading(true);
    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64Image }),
      });

      const resData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(resData.error || "Upload failed");

      const newImages = [...images, resData.url];
      await setDoc(doc(db, "settings", "customOrder"), { images: newImages }, { merge: true });
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index) => {
    const newImages = images.filter((_, i) => i !== index);
    try {
      await setDoc(doc(db, "settings", "customOrder"), { images: newImages }, { merge: true });
      toast.success("Image removed");
    } catch (err) {
      toast.error("Failed to remove image");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Custom Order Images</h2>
            <p className="text-sm text-gray-400">Upload exactly 3 images for the Custom Order section.</p>
          </div>
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="custom-upload" disabled={uploading || images.length >= 3} />
            <label htmlFor="custom-upload" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all ${uploading || images.length >= 3 ? "bg-gray-100 text-gray-400" : "bg-[var(--color-primary)] text-white hover:scale-105"}`}>
              {uploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              Add Image ({images.length}/3)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
              <Image src={url} alt={`Custom ${idx + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => handleDeleteImage(idx)} className="p-3 bg-white text-red-500 rounded-full hover:scale-110 active:scale-90 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {[...Array(3 - images.length)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center text-gray-300">
              <ImageIcon size={32} strokeWidth={1} />
              <span className="text-[10px] font-bold uppercase mt-2">Slot {images.length + i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
