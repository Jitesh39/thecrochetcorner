"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, Mail, Phone, Camera, Loader2, Save, Info } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function AdminProfileSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const { user, userData, setUserData } = useAuthStore();

  useEffect(() => {
    if (user) {
      setProfile({
        name: userData?.name || user.displayName || "Admin User",
        email: userData?.email || user.email || "",
        phone: userData?.phone || "",
        profileImage: userData?.profileImage || user.photoURL || ""
      });
      setLoading(false);
    }
  }, [user, userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let imageUrl = profile.profileImage;

      if (previewUrl) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: previewUrl }),
        });

        const resData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(resData.error || "Upload failed");
        imageUrl = resData.url;
      }

      const updatedData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        profileImage: imageUrl,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });

      // Update local state in authStore
      setUserData({ ...userData, ...updatedData });

      toast.success("Profile updated successfully!");
      setPreviewUrl(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group w-48 h-48 rounded-full overflow-hidden bg-gray-50 border-4 border-[var(--color-secondary)] shadow-inner">
              {previewUrl || profile.profileImage ? (
                <Image 
                  src={previewUrl || profile.profileImage} 
                  alt="Admin Profile" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <User size={64} strokeWidth={1} />
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold uppercase tracking-widest gap-2">
                <Camera size={24} />
                <span>Change Photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
              Recommended: Square JPG/PNG<br/>Max size: 2MB
            </p>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  readOnly
                  className="w-full bg-gray-100 border border-transparent rounded-2xl p-4 text-sm font-medium text-gray-400 cursor-not-allowed outline-none"
                />
                <p className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium pl-1">
                  <Info size={10} /> Name is linked to your Google/Auth account
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full bg-gray-100 border border-transparent rounded-2xl p-4 text-sm font-medium text-gray-400 cursor-not-allowed outline-none"
                />
                <p className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium pl-1">
                  <Info size={10} /> Email cannot be changed from settings
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-medium text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
