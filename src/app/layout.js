import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import LayoutWrapper from "@/components/LayoutWrapper";
import ToasterProvider from "@/components/ToasterProvider";
import SignupModal from "@/components/SignupModal";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "TheCrochetCorner | Handmade with Love",
  description: "Premium handmade crochet gifts, flowers, and bouquets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${nunito.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}>
        <ToasterProvider />
        <AuthInitializer />
        <LayoutWrapper>
          <SignupModal />
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
