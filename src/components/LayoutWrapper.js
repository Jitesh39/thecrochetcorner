"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminOrAccount = pathname?.startsWith("/admin") || pathname?.startsWith("/account");

  return (
    <>
      <Navbar />
      <CartDrawer />
      <ScrollToTop />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
