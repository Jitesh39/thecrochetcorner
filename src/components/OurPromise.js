import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, Users, Gift, Heart } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function OurPromise() {
  const [imageUrl, setImageUrl] = useState("/img1.png");

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
    <section className="w-full px-6 sm:px-12 lg:px-20 py-4 sm:py-8 bg-[#f5f1ed]">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">

          {/* Left Side: Image */}
          <div className="w-full lg:w-4/12 relative group max-w-sm mx-auto lg:mx-0">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt="Artisan crafting crochet bouquet"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>


          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-8/12 flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2 sm:mb-3 block">
              OUR PROMISE
            </span>
            <h2 className="text-lg md:text-3xl font-serif text-[var(--color-text-main)] font-bold mb-3 sm:mb-4 leading-tight">
              Every Piece Is Handmade With Hours of Love
            </h2>
            <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed mb-4 sm:mb-6 max-w-xl italic">
              We don't mass-produce. We don't rush. Every single stitch is placed with intention, every color chosen with care. When you hold one of our pieces, you're holding someone's time, patience, and love.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="text-[var(--color-primary)] mt-1 transition-transform duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-lg font-serif font-bold text-[var(--color-text-main)] mb-0.5">
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
