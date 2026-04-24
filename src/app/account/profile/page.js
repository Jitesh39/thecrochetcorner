"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { User, Mail, Shield, Camera, Save, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setPhone(data.phone || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check Limits
    if (userData?.photoUpdatedCount >= 2) {
      toast.error("You can only update your profile image 2 times.");
      return;
    }

    const lastUpdate = userData?.lastPhotoUpdate?.toDate();
    const now = new Date();
    if (lastUpdate && (now - lastUpdate) < 7 * 24 * 60 * 60 * 1000) {
      toast.error("You can update your profile image only once per week.");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      // Upload to Cloudinary via our API
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64Image }),
      });

      const resData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(resData.details || "Image upload failed");

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: resData.url,
        photoUpdatedCount: increment(1),
        lastPhotoUpdate: serverTimestamp()
      });

      setUserData(prev => ({
        ...prev,
        photoURL: resData.url,
        photoUpdatedCount: (prev.photoUpdatedCount || 0) + 1,
        lastPhotoUpdate: { toDate: () => new Date() } // Local update
      }));
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: phone,
        updatedAt: serverTimestamp()
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 max-w-5xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal information and profile settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center sticky top-24 overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[var(--color-secondary)]/50 to-white"></div>
              
              <div className="relative z-10">
                <div className="relative w-32 h-32 mx-auto mb-6 group/avatar">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[var(--color-primary)] text-3xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
                    {userData?.photoURL ? (
                      <Image src={userData.photoURL} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-secondary)] flex items-center justify-center">
                        {userData?.name ? userData.name[0] : <User size={48} />}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                        <Loader2 className="animate-spin text-white" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <label 
                    className={`absolute bottom-1 right-1 p-2.5 bg-[var(--color-primary)] text-white shadow-lg rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all z-30 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    title="Change profile picture"
                  >
                    <Camera size={18} />
                    <input type="file" hidden accept="image/*" onChange={handleUpload} />
                  </label>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{userData?.name || "Member"}</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">{userData?.email}</p>
                
                <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Image Updates</span>
                    <span className="font-bold text-gray-700">{userData?.photoUpdatedCount || 0} / 2</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--color-primary)] h-full transition-all duration-500" 
                      style={{ width: `${((userData?.photoUpdatedCount || 0) / 2) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-left italic">
                    Maximum 2 updates allowed. One update per week.
                  </p>
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-50">
                 <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                    <Shield size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-400 font-medium">Verify and update your basic account details</p>
                 </div>
              </div>
              
              <form onSubmit={handleSave} className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={userData?.name || ""} 
                            disabled 
                            className="w-full bg-gray-50/80 border border-transparent rounded-2xl py-4 px-6 pl-14 text-sm outline-none cursor-not-allowed text-gray-400 font-medium" 
                          />
                          <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-gray-100">Locked</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                       <div className="relative group">
                          <input 
                            type="email" 
                            value={userData?.email || ""} 
                            disabled 
                            className="w-full bg-gray-50/80 border border-transparent rounded-2xl py-4 px-6 pl-14 text-sm outline-none cursor-not-allowed text-gray-400 font-medium" 
                          />
                          <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-gray-100">Locked</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                       <div className="relative">
                          <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="10-digit phone number"
                            className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 pl-14 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] focus:shadow-sm transition-all font-bold text-gray-800" 
                          />
                          <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                       </div>
                       <p className="text-[10px] text-gray-400 ml-1">Used for order tracking and delivery updates.</p>
                    </div>
                 </div>

                 <div className="pt-8">
                    <button 
                      type="submit"
                      disabled={saving || (userData?.phone === phone && phone.length === 10)}
                      className="flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100 min-w-[200px]"
                    >
                       {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Update Profile</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}
