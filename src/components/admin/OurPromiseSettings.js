"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ImageIcon, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function OurPromiseSettings() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "ourPromise"), (docSnap) => {
      if (docSnap.exists()) {
        setImageUrl(docSnap.data().imageUrl || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

      await setDoc(doc(db, "settings", "ourPromise"), { imageUrl: resData.url }, { merge: true });
      toast.success("Image updated successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gray-800">Our Promise Image</h2>
          <p className="text-sm text-gray-400">Update the feature image shown in the Our Promise section.</p>
        </div>

        <div className="relative group max-w-md mx-auto aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xl">
          {imageUrl ? (
            <Image src={imageUrl} alt="Our Promise" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ImageIcon size={48} strokeWidth={1} />
              <span className="text-xs font-bold uppercase tracking-widest mt-4">No image set</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="promise-upload" disabled={uploading} />
             <label htmlFor="promise-upload" className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                {imageUrl ? "Change Image" : "Upload Image"}
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}
