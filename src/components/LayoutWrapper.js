"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminOrDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  return (
    <>
      <Navbar />
      <main className={`flex-grow ${isAdminOrDashboard ? "pt-0" : "pt-24"}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}
