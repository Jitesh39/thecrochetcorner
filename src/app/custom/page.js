"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Check, Send, IndianRupee, ShoppingCart, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

export default function CrochetStudio() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("idle");
  const [pricing, setPricing] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    color: "",
    size: "",
    colorType: "normal", // normal or premium
    message: "",
    name: "",
    email: "",
    phone: "",
  });

  const steps = [
    { id: 1, title: "Choose Type" },
    { id: 2, title: "Pick Colors" },
    { id: 3, title: "Select Size" },
    { id: 4, title: "Add Details" },
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

    return {
      base,
      size,
      color,
      total: base + size + color
    };
  }, [formData.type, formData.size, formData.colorType, pricing]);

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    setStatus("loading");

    try {
      await addDoc(collection(db, "customOrders"), {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        requirement: formData.message || "",
        type: formData.type || "Custom",
        color: formData.color || "Default",
        colorType: formData.colorType,
        size: formData.size || "Standard",
        status: "Pending",
        price: priceDetails.total,
        priceBreakdown: {
          base: priceDetails.base,
          size: priceDetails.size,
          color: priceDetails.color
        },
        createdAt: serverTimestamp()
      });

      setStatus("success");
      toast.success("Order request sent successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      toast.error("Failed to send request");
    }
  };

  const addToCart = async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (!formData.type || !formData.size || !formData.color) {
      toast.error("Please complete the design steps first");
      return;
    }

    setStatus("loading");
    try {
      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        productId: `custom-${Date.now()}`,
        name: `Custom ${formData.type}`,
        price: priceDetails.total,
        quantity: 1,
        image: "/custom-crochet.png", // Fallback placeholder for custom items
        category: "custom",
        customization: {
          type: formData.type,
          color: formData.color,
          size: formData.size,
          message: formData.message
        },
        createdAt: serverTimestamp()
      });
      toast.success("Added to cart!");
      router.push("/cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed] pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-[0.3em] mb-3 block">
            MAKE IT YOURS
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-4">
            Create Your Own Crochet Gift
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Design a one-of-a-kind piece that tells your story. Follow the steps below to build your personalized creation.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-12">

          {/* Left Side: Step Indicator */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-main)] mb-6">Studio Progress</h3>
              <div className="space-y-4">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${step === s.id
                      ? "bg-[var(--color-primary)] text-white scale-110 shadow-lg"
                      : step > s.id
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                      }`}>
                      {step > s.id ? <Check size={12} /> : s.id}
                    </div>
                    <div>
                      <p className={`text-xs font-bold tracking-wide ${step === s.id ? "text-[var(--color-text-main)]" : "text-gray-400"
                        }`}>
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

              {/* Price Breakdown Helper */}
              {step > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Estimated Pricing</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500 font-medium">Base Price</span>
                      <span className="text-gray-800 font-bold">₹{priceDetails.base}</span>
                    </div>
                    {priceDetails.size > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">Size Adj.</span>
                        <span className="text-green-600 font-bold">+₹{priceDetails.size}</span>
                      </div>
                    )}
                    {priceDetails.color > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">Color Adj.</span>
                        <span className="text-green-600 font-bold">+₹{priceDetails.color}</span>
                      </div>
                    )}
                    <div className="h-px bg-gray-50 my-1"></div>
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-gray-800 font-bold">Total</span>
                      <span className="text-[var(--color-primary)] font-black">₹{priceDetails.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Dynamic Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <AnimatePresence mode="wait">

                {/* Step 1: Type */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Choose Type</h2>
                      <p className="text-sm text-[var(--color-text-muted)]">Select the type of item you want to create.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {types.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelect("type", t)}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center gap-4 group ${formData.type === t
                            ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30"
                            : "border-gray-100 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                            }`}
                        >
                          <span className={`text-sm font-bold tracking-wide ${formData.type === t ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}`}>
                            {t}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Color */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <button onClick={() => setStep(1)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">&larr; Back</button>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Pick Colors</h2>
                      <p className="text-sm text-[var(--color-text-muted)]">Pick the primary yarn color for your {formData.type}.</p>
                    </div>

                    <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl w-fit mb-4">
                      {["normal", "premium"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData(prev => ({ ...prev, colorType: type }))}
                          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.colorType === type
                            ? "bg-white text-[var(--color-primary)] shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleSelect("color", c)}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center gap-4 group ${formData.color === c
                            ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30"
                            : "border-gray-100 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                            }`}
                        >
                          <span className={`text-sm font-bold tracking-wide ${formData.color === c ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}`}>
                            {c}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Size */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <button onClick={() => setStep(2)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">&larr; Back</button>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Select Size</h2>
                      <p className="text-sm text-[var(--color-text-muted)]">How big would you like your {formData.color} {formData.type} to be?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelect("size", s)}
                          className={`p-8 rounded-2xl border-2 transition-all duration-300 text-center ${formData.size === s
                            ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/30"
                            : "border-gray-100 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                            }`}
                        >
                          <span className={`text-lg font-serif font-bold ${formData.size === s ? "text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}`}>
                            {s}
                          </span>
                          {pricing?.size?.[s.toLowerCase()] > 0 && (
                            <p className="text-[10px] text-green-600 font-bold mt-1">+₹{pricing.size[s.toLowerCase()]}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Details & Submit */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <button onClick={() => setStep(3)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">&larr; Back</button>
                    </div>

                    <AnimatePresence mode="wait">
                      {status === "success" ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-10"
                        >
                          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} />
                          </div>
                          <h2 className="text-2xl font-serif font-bold text-[var(--color-text-main)] mb-2">Order Request Sent!</h2>
                          <p className="text-sm text-[var(--color-text-muted)] mb-8">
                            Thank you! Your custom order request has been sent to the studio. We'll get back to you soon.
                          </p>
                          <button
                            onClick={() => {
                              setStep(1);
                              setStatus("idle");
                            }}
                            className="btn-primary px-8 py-3"
                          >
                            Create New Project
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div className="space-y-2 mb-6">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Add Message</h2>
                            <p className="text-sm text-[var(--color-text-muted)]">Almost there! Add a message and your details for the studio.</p>
                          </div>

                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Personal Message / Requirements</label>
                              <textarea
                                placeholder="Describe any specific requirements or a personal message..."
                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[120px] text-sm transition-all"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Name *</label>
                                <input
                                  type="text"
                                  required
                                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all"
                                  value={formData.email}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                              <input
                                type="tel"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                              <button
                                type="submit"
                                disabled={status === "loading"}
                                className={`flex-1 btn-primary flex items-center justify-center gap-3 py-5 rounded-2xl shadow-lg border-0 transition-all ${status === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
                              >
                                {status === "loading" ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <>
                                    <Send size={18} />
                                    Submit Request
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={addToCart}
                                disabled={status === "loading"}
                                className="flex-1 bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold flex items-center justify-center gap-3 py-5 rounded-2xl hover:bg-[var(--color-secondary)]/10 transition-all active:scale-95"
                              >
                                <ShoppingCart size={18} />
                                Add to Cart
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
