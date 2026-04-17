import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import LayoutWrapper from "@/components/LayoutWrapper";

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
      <body className={`${nunito.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}>
        <AuthInitializer />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
