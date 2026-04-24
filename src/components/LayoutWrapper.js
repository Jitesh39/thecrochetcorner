"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import MobileHeader from "@/components/MobileHeader";
import MobileUserNav from "@/components/MobileUserNav";
import { useAuthStore } from "@/store/authStore";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <MobileHeader />}
      {!isAdminPage && <MobileUserNav />}
      {!isAdminPage && <Navbar />}
      <CartDrawer />
      <ScrollToTop />
      <main className={`w-full flex-grow min-h-screen ${!isAdminPage && pathname !== '/' && pathname !== '/about' ? 'px-3 sm:px-4 md:px-6 lg:px-8' : ''} ${!isAdminPage ? 'pt-[60px]' : ''} lg:pt-0`}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}
