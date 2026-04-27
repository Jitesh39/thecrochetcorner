"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export default function SignupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [modalType, setModalType] = useState(null); // 'GUEST' | 'CUSTOMER_NEW' | null
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    const checkStatusAndShow = async () => {
      let key = "";
      let type = null;

      if (!user) {
        key = "signupModalShown";
        type = 'GUEST';
      } else {
        // User is logged in, check order history
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("userId", "==", user.uid), limit(1));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            key = "offerModalShown";
            type = 'CUSTOMER_NEW';
          } else {
            // User has orders, mark everything as shown so it never triggers
            sessionStorage.setItem("signupModalShown", "true");
            sessionStorage.setItem("offerModalShown", "true");
            setHasShown(true);
            return;
          }
        } catch (error) {
          console.error("Error checking order history:", error);
          return;
        }
      }

      // Check if the specific key for this state has already been shown in session
      if (sessionStorage.getItem(key) === "true") {
        setHasShown(true);
        return;
      }

      setModalType(type);

      // Trigger Logic with safety check
      let isTriggered = false;

      const triggerModal = () => {
        if (!isTriggered && !hasShown) {
          isTriggered = true;
          // Mark this specific state as shown
          sessionStorage.setItem(key, "true");
          setHasShown(true);
          setIsOpen(true);
          document.body.style.overflow = "hidden"; // Disable scroll
        }
      };

      // Timer trigger (3s)
      const timer = setTimeout(triggerModal, 3000);

      // Scroll trigger (40%)
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (scrollY / height) * 100;

        if (scrolled >= 40) {
          triggerModal();
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", handleScroll);
      };
    };

    checkStatusAndShow();
  }, [user, loading, hasShown]);

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset"; // Enable scroll
  };

  // Content Mapping
  const content = {
    GUEST: {
      tag: "A Cozy Surprise Awaits ✨",
      title: "Welcome to The Crochet Corner",
      subtitle: "Signup & get FREE delivery on your first order",
      description: "Handmade crochet products crafted with love. Join our community now & unlock your first perk!",
      ctaText: "Signup & Claim Offer",
      ctaLink: "/login",
      icon: <Gift className="text-[var(--color-primary)]" size={20} />
    },
    CUSTOMER_NEW: {
      tag: "Special Offer For You 🚚",
      title: "Free Delivery on Your First Order",
      subtitle: "Claim your exclusive offer now",
      description: "Start your crochet journey today. Enjoy free shipping on any item from our latest collection!",
      ctaText: "Claim Offer",
      ctaLink: "/shop",
      icon: <Truck className="text-[var(--color-primary)]" size={20} />
    }
  };

  const activeContent = content[modalType];

  return (
    <AnimatePresence>
      {isOpen && activeContent && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] cursor-pointer"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[10000] bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col items-center px-6 pb-10 pt-12 max-w-2xl mx-auto border-t border-gray-100"
          >
            {/* Handle / Pill at top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="text-center w-full max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-4 py-2 rounded-full mb-6"
              >
                <Sparkles size={14} className="text-[var(--color-primary)]" />
                <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">
                  {activeContent.tag}
                </span>
              </motion.div>

              <div className="flex flex-col items-center justify-center gap-3 mb-4">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[var(--color-text-main)] leading-tight">
                  {activeContent.title}
                </h2>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <p className="text-lg sm:text-xl font-medium text-[var(--color-primary)] flex items-center justify-center gap-2">
                  {activeContent.subtitle} {activeContent.icon}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {activeContent.description}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 w-full">
                <Link
                  href={activeContent.ctaLink}
                  onClick={closeModal}
                  className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[#ff8da1] text-white rounded-full font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  {activeContent.ctaText}
                </Link>
              </div>
            </div>

            {/* Aesthetic Background Sparkles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-t-[2.5rem]">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

