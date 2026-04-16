"use client";

import Image from "next/image";
import { Clock, Users, Gift, Heart } from "lucide-react";

export default function OurPromise() {
  const stats = [
    { icon: <Clock className="w-5 h-5" />, number: "100+", label: "Hours of Crafting" },
    { icon: <Users className="w-5 h-5" />, number: "50+", label: "Happy Customers" },
    { icon: <Gift className="w-5 h-5" />, number: "20+", label: "Custom Orders Monthly" },
    { icon: <Heart className="w-5 h-5" />, number: "100%", label: "Handmade with Love" },
  ];

  return (
    <section className="py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left Side: Image */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1563241527-300eceac2e19?q=80&w=800"
                alt="Artisan crafting crochet bouquet"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 flex flex-col items-center justify-center animate-bounce-subtle">
              <span className="text-[var(--color-primary)] font-serif text-2xl font-bold">12+</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">hrs per bouquet</span>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4 block">
              OUR PROMISE
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-text-main)] font-bold mb-8 leading-tight">
              Every Piece Is Handmade With Hours of Love
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed mb-12 max-w-xl">
              We don't mass-produce. We don't rush. Every single stitch is placed with intention, every color chosen with care. When you hold one of our pieces, you're holding someone's time, patience, and love.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-gray-200">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-3 group">
                  <div className="text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-bold text-[var(--color-text-main)] mb-1">
                      {stat.number}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-gray-400 font-medium">
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
