import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, Twitter, Mail, Heart } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, getDocs, query, limit } from "firebase/firestore";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [contact, setContact] = useState({
    email: "hello@thecrochetcorner.com",
    instagram: "https://www.instagram.com/"
  });

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  const handleAccountClick = (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "contact"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContact({
          email: data.email || "hello@thecrochetcorner.com",
          instagram: data.instagram || "https://www.instagram.com/"
        });
      }
    });
    return () => unsub();
  }, []);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), limit(4));
        const snap = await getDocs(q);
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Do not render footer on account/admin
  if (pathname.startsWith("/account")) {
    return null;
  }
  if (pathname.startsWith("/admin")) {
    return null;
  }
  const isProductPage = pathname?.startsWith("/product/");

  return (
    <footer className={`${isProductPage ? "hidden lg:block" : ""} bg-white border-t border-[var(--color-secondary)] pt-12 pb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-12 w-48">
                <Image src="/logo1.png" alt="TheCrochetCorner" fill className="object-contain object-left" />
              </div>
            </Link>
            <p className="text-[var(--color-text-muted)] text-sm mb-6 leading-relaxed">
              Handcrafted crochet gifts, elegant bouquets, and cozy accessories made with love and attention to detail. Every piece tells a unique story.
            </p>
            <div className="flex space-x-4 text-[var(--color-text-muted)]">
              <a href={contact.instagram.startsWith('http') ? contact.instagram : `https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors"><Instagram size={20} /></a>
              <a href={`mailto:${contact.email}`} className="hover:text-[var(--color-primary)] transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <h4 className="font-medium text-[var(--color-text-main)] mb-4 tracking-wide uppercase text-sm">Categories</h4>
              <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              <li><a href="#" onClick={handleAccountClick} className="hover:text-[var(--color-primary)] transition-colors">My Account</a></li>
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
