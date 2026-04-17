"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, Twitter, Mail, Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Do not render footer on dashboard
  if (pathname.startsWith("/dashboard")) {
    return null;
  }
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-white border-t border-[var(--color-secondary)] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif text-2xl font-bold text-[var(--color-primary)] mb-4">TheCrochetCorner</h3>
            <p className="text-[var(--color-text-muted)] text-sm max-w-sm mb-6 leading-relaxed">
              Handcrafted crochet gifts, elegant bouquets, and cozy accessories made with love and attention to detail. Every piece tells a unique story.
            </p>
            <div className="flex space-x-4 text-[var(--color-text-muted)]">
              <a href="https://www.instagram.com/" className="hover:text-[var(--color-primary)] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--color-text-main)] mb-4 tracking-wide uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li><Link href="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop All</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">Our Story</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-primary)] transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-[var(--color-text-main)] mb-4 tracking-wide uppercase text-sm">Customer Care</h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li><Link href="/dashboard" className="hover:text-[var(--color-primary)] transition-colors">My Account</Link></li>
              <li><Link href="/shipping" className="hover:text-[var(--color-primary)] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--color-secondary)] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} TheCrochetCorner. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Handmade with <Heart size={12} className="mx-1 text-[var(--color-primary)] fill-[var(--color-primary)]" /> and lots of yarn.
          </p>
        </div>
      </div>
    </footer>
  );
}
