"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Check, Send, IndianRupee, ShoppingCart, Info, Loader2, Image as ImageIcon, Calendar, Wallet, Sparkles, Paintbrush, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

export default function CrochetStudio() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [mode, setMode] = useState("smart");
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("idle");
  const [pricing, setPricing] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Smart Custom Form Data
  const [formData, setFormData] = useState({
    type: "",
    color: "",
    size: "",
    colorType: "normal",
    message: "",
  });

  // Full Custom Form Data
  const [fullCustomData, setFullCustomData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Bouquet",
    description: "",
    budget: "",
    deliveryDate: "",
    image: null,
    imagePreview: null
  });

  // Fetch User Profile
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          setFullCustomData(prev => ({
            ...prev,
            name: docSnap.data().name || user.displayName || "",
            email: docSnap.data().email || user.email || "",
            phone: docSnap.data().phone || ""
          }));
        }
      });
      return () => unsub();
    }
  }, [user]);

  const steps = [
    { id: 1, title: "Choose Type" },
    { id: 2, title: "Pick Colors" },
    { id: 3, title: "Select Size" },
    { id: 4, title: "Finalize" },
  ];

  const types = ["Bouquet", "Soft Toy", "Keychain", "Gift Set", "Flower Pot", "Jhumka"];
  const colors = ["Blush Pink", "Lavender", "Sage Green", "Cream", "Sunset Orange", "Sky Blue"];
  const sizes = ["Small", "Medium", "Large", "Extra Large"];

  // Fetch Pricing Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "customPricing"), (docSnap) => {
      if (docSnap.exists()) {
        setPricing(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  // Calculate Price
  const priceDetails = useMemo(() => {
    if (!pricing) return { base: 0, size: 0, color: 0, total: 0 };

    const typeKey = formData.type.toLowerCase().replace(/\s+/g, "");
    const sizeKey = formData.size.toLowerCase().replace(/\s+/g, "");
    const colorTypeKey = formData.colorType.toLowerCase();

    const base = pricing.basePrice?.[typeKey] || 0;
    const size = pricing.size?.[sizeKey] || 0;
    const color = pricing.color?.[colorTypeKey] || 0;

    return { base, size, color, total: base + size + color };
  }, [formData.type, formData.size, formData.colorType, pricing]);

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (step < 4) setStep(step + 1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFullCustomData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "crochet_preset");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const { addItem } = useCartStore();

  const getFallbackImage = (type) => {
    const images = {
      "Bouquet": "/img1.png",
      "Soft Toy": "/img2.png",
      "Keychain": "/img3.png",
      "Gift Set": "/img4.png",
      "Flower Pot": "/img5.png",
      "Jhumka": "/img6.png"
    };
    return images[type] || "/custom-crochet.png";
  };

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (!userProfile?.phone || !userProfile?.address) {
      toast.error("Please complete your profile details first");
      router.push("/account/addresses");
      return;
    }

    setStatus("loading");
    try {
      const customId = `custom_${formData.type}_${formData.color}_${formData.size}`.toLowerCase().replace(/\s+/g, "_");
      const productPrice = priceDetails.total;
      const productImage = getFallbackImage(formData.type);

      const customProduct = {
        id: customId,
        name: `${formData.type} (${formData.color}, ${formData.size})`,
        category: "Custom",
        type: formData.type,
        color: formData.color,
        size: formData.size,
        price: productPrice,
        image: productImage,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      console.log("Saving Smart Custom Order:", {
        type: formData.type,
        color: formData.color,
        size: formData.size,
        message: formData.message || "No special instructions",
        user: user.uid
      });

      // 1. Save in Firestore (customOrders) - Flat Structure
      await addDoc(collection(db, "customOrders"), {
        orderId: `CUST-${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || userProfile.name,
        userEmail: user.email,
        userPhone: userProfile.phone || "",
        type: formData.type,
        color: formData.color,
        size: formData.size,
        message: formData.message || "No special instructions",
        price: productPrice,
        status: "pending",
        source: "smart",
        createdAt: serverTimestamp()
      });

      // 2. Add to Cart (Firestore Persistence)
      const cartItemRef = doc(db, "carts", user.uid, "items", customId);
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          quantity: cartItemSnap.data().quantity + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(cartItemRef, {
          productId: customProduct.id,
          name: customProduct.name,
          price: customProduct.price,
          image: customProduct.image,
          type: formData.type,
          color: formData.color,
          size: formData.size,
          quantity: 1,
          isCustom: true,
          createdAt: serverTimestamp()
        });
      }

      // 3. Admin Notification
      await addDoc(collection(db, "notifications"), {
        type: "custom_order",
        message: `New smart custom order: ${customProduct.name}`,
        userId: user.uid,
        product: customProduct.name,
        read: false,
        createdAt: serverTimestamp()
      });

      // 4. Update Local Cart Store
      addItem(customProduct, 1);

      toast.success("Custom product added to cart 🧶");
      router.push("/cart");
    } catch (error) {
      console.error("Cart Error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setStatus("idle");
    }
  };

  const handleSubmitFull = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (!userProfile?.phone) {
      toast.error("Please add your phone number in Profile Settings first");
      router.push("/account/addresses");
      return;
    }

    setStatus("loading");
    try {
      console.log("Saving Full Custom Request:", {
        type: fullCustomData.type,
        message: fullCustomData.description,
        user: user.uid
      });

      let imageUrl = null;
      if (fullCustomData.image) {
        imageUrl = await uploadToCloudinary(fullCustomData.image);
      }

      await addDoc(collection(db, "customOrders"), {
        orderId: `CUST-${Date.now()}`,
        userId: user.uid,
        userName: fullCustomData.name || userProfile.name,
        userEmail: fullCustomData.email || user.email,
        userPhone: fullCustomData.phone || userProfile.phone || "",
        type: fullCustomData.type,
        color: "User Specified",
        size: "User Specified",
        message: fullCustomData.description,
        budget: fullCustomData.budget || "Not Specified",
        deliveryDate: fullCustomData.deliveryDate || "Not Specified",
        imageUrl,
        status: "pending",
        price: 0,
        source: "full",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        type: "full_custom_request",
        message: `New full custom request from ${fullCustomData.name || user.email}`,
        userId: user.uid,
        read: false,
        createdAt: serverTimestamp()
      });

      setStatus("success");
      toast.success("Custom request submitted!");
      router.push("/account/orders");
    } catch (error) {
      console.error("Custom Request Error:", error);
      toast.error("Submission failed");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed] pt-0 lg:pt-16 pb-12 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-12">
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-[0.3em] mb-3 block">
            THE CROCHET STUDIO
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-6">
            Your Vision, Our Craft
          </h1>

          {/* Mode Switcher */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => { setMode("smart"); setStep(1); setStatus("idle"); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === "smart" ? "bg-[var(--color-primary)] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <Sparkles size={14} /> Smart Custom
              </button>
              <button
                onClick={() => { setMode("full"); setStatus("idle"); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === "full" ? "bg-[var(--color-primary)] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <Paintbrush size={14} /> Full Custom
              </button>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {mode === "smart" ? "Quick pricing with predefined combinations ⚡" : "Have a unique idea? Tell us exactly what you want 🎨"}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

          {/* Left Side: Progress */}
          <div className="w-full lg:w-1/4 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-main)] mb-6">
                {mode === "smart" ? "Studio Progress" : "Design Summary"}
              </h3>

              {mode === "smart" ? (
                <div className="space-y-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${step === s.id
                        ? "bg-[var(--color-primary)] text-white scale-110 shadow-lg"
                        : step > s.id ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}>
                        {step > s.id ? <Check size={12} /> : s.id}
                      </div>
                      <div>
                        <p className={`text-xs font-bold tracking-wide ${step === s.id ? "text-[var(--color-text-main)]" : "text-gray-400"}`}>
                          {s.title}
                        </p>
                        {step > s.id && (
                          <p className="text-[10px] text-[var(--color-primary)] mt-0.5 font-medium italic">
                            {formData[Object.keys(formData)[s.id - 1]]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">How it works</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Share your reference images and details. Our team will review and provide a custom quote within 24 hours.
                    </p>
                  </div>
                  {fullCustomData.imagePreview && (
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[var(--color-secondary)]">
                      <img src={fullCustomData.imagePreview} className="object-cover w-full h-full" alt="Reference" />
                    </div>
                  )}
                </div>
              )}

              {mode === "smart" && step > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Estimated Pricing</p>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price</span>
                      <span className="text-gray-800 font-bold">₹{priceDetails.base}</span>
                    </div>
                    {priceDetails.size > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size Adj.</span>
                        <span className="text-green-600 font-bold">+₹{priceDetails.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-50 font-bold text-sm">
                      <span className="text-gray-800">Total</span>
                      <span className="text-[var(--color-primary)] font-black">₹{priceDetails.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Forms */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-[2rem] p-4 sm:p-8 md:p-12 shadow-sm border border-gray-100 min-h-[500px]">
              <AnimatePresence mode="wait">

                {mode === "smart" ? (
                  <motion.div key="smart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {/* Step 1: Type */}
                    {step === 1 && (
                      <div className="space-y-4 sm:space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Choose Type</h2>
                          <p className="text-sm text-[var(--color-text-muted)]">Select the base item for your custom order.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                          {types.map((t) => (
                            <button key={t} onClick={() => handleSelect("type", t)} className={`p-6 rounded-2xl border-2 transition-all ${formData.type === t ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30 scale-105" : "border-gray-100 hover:border-[var(--color-primary)]/50"}`}>
                              <span className="text-sm font-bold tracking-wide">{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Colors */}
                    {step === 2 && (
                      <div className="space-y-8">
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all">&larr; BACK TO TYPE</button>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Pick Colors</h2>
                          <p className="text-sm text-[var(--color-text-muted)]">Choose the primary palette for your {formData.type}.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                          {colors.map((c) => (
                            <button key={c} onClick={() => handleSelect("color", c)} className={`p-6 rounded-2xl border-2 transition-all ${formData.color === c ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30 scale-105" : "border-gray-100 hover:border-[var(--color-primary)]/50"}`}>
                              <span className="text-sm font-bold tracking-wide">{c}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Size */}
                    {step === 3 && (
                      <div className="space-y-8">
                        <button onClick={() => setStep(2)} className="text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all">&larr; BACK TO COLORS</button>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Select Size</h2>
                          <p className="text-sm text-[var(--color-text-muted)]">Define the scale of your custom creation.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          {sizes.map((s) => (
                            <button key={s} onClick={() => handleSelect("size", s)} className={`p-8 rounded-2xl border-2 transition-all text-center ${formData.size === s ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30 scale-105" : "border-gray-100 hover:border-[var(--color-primary)]/50"}`}>
                              <span className="text-lg font-serif font-bold block">{s}</span>
                              {pricing?.size?.[s.toLowerCase()] > 0 && <span className="text-[10px] text-green-600 font-bold">+₹{pricing.size[s.toLowerCase()]}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Finalize Build */}
                    {step === 4 && (
                      <div className="space-y-8">
                        <button onClick={() => setStep(3)} className="text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all">&larr; BACK TO SIZE</button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Order Summary */}
                          <div className="space-y-6">
                            <h3 className="text-xl font-serif font-bold text-[var(--color-text-main)]">Design Summary</h3>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Product Type</span>
                                <span className="text-[var(--color-text-main)] font-bold">{formData.type}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Selected Color</span>
                                <span className="text-[var(--color-text-main)] font-bold">{formData.color}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Chosen Size</span>
                                <span className="text-[var(--color-text-main)] font-bold">{formData.size}</span>
                              </div>
                              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-gray-800 font-bold">Total Price</span>
                                <span className="text-xl font-black text-[var(--color-primary)]">₹{priceDetails.total}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Personal Message (Optional)</label>
                              <textarea
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Any specific requirements?"
                                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all min-h-[100px]"
                              />
                            </div>
                          </div>

                          {/* Delivery Details */}
                          <div className="space-y-6">
                            <h3 className="text-xl font-serif font-bold text-[var(--color-text-main)]">Delivery Details</h3>
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</p>
                                <p className="text-sm font-bold text-[var(--color-text-main)]">{userProfile?.name || user?.displayName || "N/A"}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                <p className="text-sm font-bold text-[var(--color-text-main)]">{userProfile?.email || user?.email || "N/A"}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                <p className="text-sm font-bold text-[var(--color-text-main)]">{userProfile?.phone || "Phone not added"}</p>
                              </div>
                              <div className="pt-3 border-t border-gray-100 space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping Address</p>
                                {userProfile?.address ? (
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-xs text-gray-600 leading-relaxed">{userProfile.address}</p>
                                    <button
                                      onClick={() => router.push("/account/addresses")}
                                      className="text-[10px] font-bold text-[var(--color-primary)] uppercase underline shrink-0"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => router.push("/account/addresses")}
                                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
                                  >
                                    + Add Address (Required)
                                  </button>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={addToCart}
                              disabled={status === "loading"}
                              className="w-full btn-primary py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                              {status === "loading" ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> Add to Cart & Checkout</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Full Custom Request</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">Share your unique idea with us and we'll bring it to life.</p>
                      </div>

                      <form onSubmit={handleSubmitFull} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Product Type</label>
                            <select
                              value={fullCustomData.type}
                              onChange={(e) => setFullCustomData(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all appearance-none"
                            >
                              {types.map(t => <option key={t} value={t}>{t}</option>)}
                              <option value="Other">Something Else</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={fullCustomData.phone}
                              onChange={(e) => setFullCustomData(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Detailed Description *</label>
                          <textarea
                            required
                            value={fullCustomData.description}
                            onChange={(e) => setFullCustomData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe colors, patterns, and any specific details..."
                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-6 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all min-h-[150px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                              <Wallet size={12} /> Expected Budget (₹)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 1500"
                              value={fullCustomData.budget}
                              onChange={(e) => setFullCustomData(prev => ({ ...prev, budget: e.target.value }))}
                              className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                              <Calendar size={12} /> Desired Delivery Date
                            </label>
                            <input
                              type="date"
                              value={fullCustomData.deliveryDate}
                              onChange={(e) => setFullCustomData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                              className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                            <ImageIcon size={12} /> Reference Image (Optional)
                          </label>
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:bg-gray-100/50 transition-all">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                                <ImageIcon size={24} />
                              </div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {fullCustomData.image ? fullCustomData.image.name : "Click to upload reference"}
                              </p>
                              <p className="text-[10px] text-gray-400">PNG, JPG, JPEG up to 5MB</p>
                            </div>
                          </div>
                        </div>

                        <button type="submit" disabled={status === "loading"} className="w-full btn-primary py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-4">
                          {status === "loading" ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Send Custom Request</>}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
