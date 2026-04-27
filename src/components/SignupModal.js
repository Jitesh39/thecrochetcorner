"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function SignupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Don't show if user is already logged in or still loading
    if (user || loading) return;

    // Check if user has already seen the modal in this session
    const shownBefore = sessionStorage.getItem("signup_modal_shown");
    if (shownBefore) {
      setHasShown(true);
      return;
    }

    // Trigger after 3 seconds
    const timer = setTimeout(() => {
      if (!hasShown) {
        showModal();
      }
    }, 3000);

    // Trigger on 40% scroll
    const handleScroll = () => {
      if (hasShown) return;
      
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollY / height) * 100;

      if (scrolled >= 40) {
        showModal();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown, user, loading]);

  const showModal = () => {
    setIsOpen(true);
    setHasShown(true);
    sessionStorage.setItem("signup_modal_shown", "true");
    document.body.style.overflow = "hidden"; // Disable scroll
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset"; // Enable scroll
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                  Limited Time Offer
                </span>
              </motion.div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[var(--color-text-main)]">
                  Welcome to The Crochet Corner
                </h2>
                <span className="text-3xl">🧶</span>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <p className="text-lg sm:text-xl font-medium text-[var(--color-primary)] flex items-center justify-center gap-2">
                  Signup now & get FREE delivery on your first order <Gift size={20} className="inline" />
                </p>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Handmade crochet products crafted with love. Join our community now & unlock your first perk!
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 w-full">
                <Link
                  href="/login"
                  onClick={closeModal}
                  className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[#ff8da1] text-white rounded-full font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  Signup & Claim Offer
                </Link>
                
                <button
                  onClick={closeModal}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  Maybe later
                </button>
              </div>
            </div>

            {/* Aesthetic Background Sparkles (Optional Decorations) */}
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
