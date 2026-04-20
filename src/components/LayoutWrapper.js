"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminOrDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
