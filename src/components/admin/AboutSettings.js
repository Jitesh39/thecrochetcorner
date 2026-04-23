"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { ImageIcon, RefreshCw, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AboutSettings() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "about"), (docSnap) => {
      if (docSnap.exists()) {
        setImageUrl(docSnap.data().aboutImage || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!previewUrl) return;

    setUploading(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: previewUrl }),
      });

      const resData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(resData.error || "Upload failed");

      await setDoc(doc(db, "settings", "about"), {
        aboutImage: resData.url,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success("About image updated successfully");
      setPreviewUrl(null);
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
          <h2 className="text-lg font-bold text-gray-800">About Page Image</h2>
          <p className="text-sm text-gray-400">Update the primary image shown on your story page.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Current Image */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Currently Saved</label>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              {imageUrl ? (
                <Image src={imageUrl} alt="Current About" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <ImageIcon size={32} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload New Image */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Update Image</label>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 group flex flex-col items-center justify-center p-2">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select new image<br />(Max 2MB)</p>
                </div>
              )}

              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleImageUpload}
            disabled={!previewUrl || uploading}
            className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {imageUrl ? "Update Image" : "Upload Image"}
          </button>

          {previewUrl && (
            <button
              onClick={() => setPreviewUrl(null)}
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all text-xs"
            >
              Cancel Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
