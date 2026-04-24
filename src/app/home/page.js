"use client";

import { useAuthStore } from "@/store/authStore";
import HomeContent from "@/app/page";
import { motion } from "framer-motion";

export default function UserHomePage() {
  const { user } = useAuthStore();
  const name = user?.displayName || user?.email?.split('@')[0] || "Friend";

  return (
    <div className="min-h-screen mt-0 pt-0">
      <HomeContent />
    </div>
  );
}
