import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, Users, Gift, Heart } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function OurPromise() {
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1563241527-300eceac2e19?q=80&w=800");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "ourPromise"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().imageUrl) {
        setImageUrl(docSnap.data().imageUrl);
      }
    });
    return () => unsub();
  }, []);
  const stats = [
    { icon: <Clock className="w-5 h-5" />, number: "100+", label: "Hours of Crafting" },
    { icon: <Users className="w-5 h-5" />, number: "50+", label: "Happy Customers" },
    { icon: <Gift className="w-5 h-5" />, number: "20+", label: "Custom Orders Monthly" },
    { icon: <Heart className="w-5 h-5" />, number: "100%", label: "Handmade with Love" },
  ];

  return (
    <section className="w-full px-3 sm:px-4 lg:px-8 py-10 sm:py-16 bg-[#f5f1ed]">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16">

          {/* Left Side: Image */}
          <div className="w-full lg:w-5/12 relative group lg:max-w-none">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
              <Image
                src={imageUrl}
                alt="Artisan crafting crochet bouquet"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-4 -right-2 bg-white p-4 rounded-xl shadow-lg border border-gray-50 flex flex-col items-center justify-center animate-bounce-subtle z-10">
              <span className="text-[var(--color-primary)] font-serif text-xl sm:text-2xl font-bold">12+</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">hrs per bouquet</span>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-4 block">
              OUR PROMISE
            </span>
            <h2 className="text-2xl md:text-5xl font-serif text-[var(--color-text-main)] font-bold mb-4 sm:mb-6 leading-tight">
              Every Piece Is Handmade With Hours of Love
            </h2>
            <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed mb-6 sm:mb-10 max-w-xl italic">
              We don't mass-produce. We don't rush. Every single stitch is placed with intention, every color chosen with care. When you hold one of our pieces, you're holding someone's time, patience, and love.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-gray-200">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="text-[var(--color-primary)] mt-1 transition-transform duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xl font-serif font-bold text-[var(--color-text-main)] mb-0.5">
                      {stat.number}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
