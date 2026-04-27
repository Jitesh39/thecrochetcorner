"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { ImageIcon, Trash2, Plus, Save, Loader2, Type } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function HeroSettings() {
  const [slides, setSlides] = useState([]);
  const [typingLines, setTypingLines] = useState([
    "Crafted with Love, Made to Last",
    "Every Thread, A Story",
    "Handmade with Heart",
    "Where Threads Turn into Memories"
  ]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "hero"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let heroSlides = data.heroSlides || [];
        // Migration: if heroSlides is empty but images exists, migrate it
        if (heroSlides.length === 0 && data.images && data.images.length > 0) {
          heroSlides = data.images.map(url => ({ type: "image", url }));
        }
        setSlides(heroSlides);
        setTypingLines(data.typingLines || [
          "Crafted with Love, Made to Last",
          "Every Thread, A Story",
          "Handmade with Heart",
          "Where Threads Turn into Memories"
        ]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (slides.length >= 5) {
      toast.error("Maximum 5 slides allowed");
      return;
    }

    // Performance rules: Size checks
    const isVideo = file.type.startsWith("video");
    const maxSize = isVideo ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for video, 2MB for image
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? "5MB for videos" : "2MB for images"}`);
      return;
    }

    setUploading(true);
    try {
      const base64File = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64File }),
      });

      const resData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(resData.error || "Upload failed");

      const type = resData.resource_type === "video" ? "video" : "image";
      const newSlides = [...slides, { url: resData.url, type }];
      
      await setDoc(doc(db, "settings", "hero"), { 
        heroSlides: newSlides, 
        typingLines,
        images: newSlides.filter(s => s.type === "image").map(s => s.url) // Keep images field for partial backward compat if needed
      }, { merge: true });
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSlide = async (index) => {
    const newSlides = slides.filter((_, i) => i !== index);
    try {
      await updateDoc(doc(db, "settings", "hero"), { 
        heroSlides: newSlides,
        images: newSlides.filter(s => s.type === "image").map(s => s.url)
      });
      toast.success("Slide removed");
    } catch (err) {
      toast.error("Failed to remove slide");
    }
  };

  const handleSaveText = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "hero"), { heroSlides: slides, typingLines }, { merge: true });
      toast.success("Text lines saved");
    } catch (err) {
      toast.error("Failed to save text lines");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Hero Section Settings</h1>
        <p className="text-sm text-gray-400 font-medium">Manage background images, videos and animated text for the homepage hero.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon size={20} className="text-[var(--color-primary)]" />
              Hero Slides ({slides.length}/5)
            </h2>
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="hero-upload"
                disabled={uploading || slides.length >= 5}
              />
              <label
                htmlFor="hero-upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${uploading || slides.length >= 5
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95 shadow-md shadow-[var(--color-primary)]/10"
                  }`}
              >
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                Add Media
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-grow">
            {slides.map((item, idx) => (
              <div key={idx} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                {item.type === "video" ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                    <video src={item.url} className="w-full h-full object-cover opacity-50" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Plus className="text-white rotate-45" size={24} /> {/* Placeholder icon for video */}
                      </div>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-[10px] text-white rounded-md font-bold uppercase tracking-wider">Video</span>
                  </div>
                ) : (
                  <Image src={item.url} alt={`Hero ${idx + 1}`} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteSlide(idx)}
                    className="p-3 bg-white text-red-500 rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {slides.length === 0 && (
              <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest mt-4">No media uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Typing Text Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Type size={20} className="text-[var(--color-primary)]" />
              Animated Typing Text
            </h2>
            <button
              onClick={handleSaveText}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save Changes
            </button>
          </div>

          <div className="space-y-4 flex-grow">
            {typingLines.map((line, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Line {idx + 1}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const newLines = [...typingLines];
                      newLines[idx] = e.target.value;
                      setTypingLines(newLines);
                    }}
                    placeholder={`Phrase ${idx + 1}...`}
                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-medium text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                  />
                  {typingLines.length > 1 && (
                    <button
                      onClick={() => setTypingLines(typingLines.filter((_, i) => i !== idx))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typingLines.length < 6 && (
              <button
                onClick={() => setTypingLines([...typingLines, ""])}
                className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/20 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Line
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
