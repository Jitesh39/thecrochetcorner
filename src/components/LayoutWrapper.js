"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import MobileUserNav from "@/components/MobileUserNav";
import { useAuthStore } from "@/store/authStore";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <MobileUserNav />}
      <Navbar />
      <CartDrawer />
      <ScrollToTop />
      <main className="flex-grow mt-0 pt-0">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}
