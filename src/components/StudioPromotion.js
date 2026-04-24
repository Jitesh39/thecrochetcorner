"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function StudioPromotion() {
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1623910385973-7740eeb2e250?q=80&w=400",
    "https://images.unsplash.com/photo-1563241527-300eceac2e19?q=80&w=400",
    "https://images.unsplash.com/photo-1605338661642-cc019ba2f9ec?q=80&w=400"
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "customOrder"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().images?.length === 3) {
        setImages(docSnap.data().images);
      }
    });
    return () => unsub();
  }, []);

  return (
    <section className="w-full px-3 sm:px-4 lg:px-8 py-10 sm:py-16 bg-white relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#faf9f8] -skew-x-12 transform translate-x-20 hidden lg:block"></div>
      
      <div className="w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-16">
          {/* Content Side */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <div className="h-[1px] w-8 bg-[var(--color-primary)]"></div>
              <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-[0.3em]">
                NEW FEATURE
              </span>
            </div>
            
            <h2 className="text-3xl md:text-6xl font-serif font-bold text-[var(--color-text-main)] mb-6 sm:mb-8 leading-tight">
              Design Your Own <br />
              <span className="text-[var(--color-primary)]">Custom Crochet</span>
            </h2>
            
            <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0 italic">
              From choosing the perfect shade of blush pink to adding a personalized message, our new Crochet Studio lets you create the perfect gift down to the last stitch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center lg:items-start justify-center lg:justify-start">
              <Link href="/custom" className="px-10 py-4 bg-[var(--color-primary)] text-white rounded-full font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
                Start Designing
              </Link>
              <p className="text-sm font-medium text-[var(--color-text-muted)] italic">
                - Fully personalized & handmade
              </p>
            </div>
            
            {/* Minimal Stat Icons */}
            <div className="grid grid-cols-3 gap-8 mt-10 sm:mt-16 pt-8 border-t border-gray-100 max-w-sm mx-auto lg:mx-0">
               <div>
                 <p className="text-2xl font-serif font-bold text-[var(--color-text-main)]">15+</p>
                 <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Colors</p>
               </div>
               <div>
                 <p className="text-2xl font-serif font-bold text-[var(--color-text-main)]">6</p>
                 <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Base Types</p>
               </div>
               <div>
                 <p className="text-2xl font-serif font-bold text-[var(--color-text-main)]">0</p>
                 <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Machine Made</p>
               </div>
            </div>
          </div>
          
          {/* Image Side - Collage Look */}
          <div className="w-full lg:w-1/2 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                  <Image src={images[0]} alt="Crochet process" fill className="object-cover" />
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                  <Image src={images[1]} alt="Colorful yarn" fill className="object-cover" />
                </div>
              </div>
              <div className="pt-8 sm:pt-12 space-y-4">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg border-4 sm:border-8 border-white">
                  <Image src={images[2]} alt="Finished custom gift" fill className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                    <p className="text-white text-xs font-medium italic">Hand-stitched for You</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Absolute Decorative Tag */}
            <div className="absolute -top-4 -right-2 bg-[var(--color-primary)] text-white p-4 sm:p-6 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-center leading-tight rotate-12 shadow-xl border-4 border-white z-20">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-tighter">100% Unique</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
