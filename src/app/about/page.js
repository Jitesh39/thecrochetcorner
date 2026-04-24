"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Users, Sparkles, Award, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function AboutPage() {
  const [aboutImage, setAboutImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "about"), (docSnap) => {
      if (docSnap.exists()) {
        setAboutImage(docSnap.data().aboutImage || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const defaultImage = "/img1.png";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-secondary)] py-10 sm:py-12 lg:py-20">
        <div className="w-full px-6 sm:px-12 lg:px-20 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[var(--color-text-main)] mb-4 sm:mb-6">Our Story</h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            From a single ball of yarn to a beloved handmade brand. Discover the passion behind every stitch at The Crochet Corner.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-10 sm:py-12 lg:py-24">
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl z-10 bg-gray-50 flex items-center justify-center">
                {loading ? (
                  <Loader2 className="animate-spin text-[var(--color-primary)]" />
                ) : (
                  <Image
                    src={aboutImage || defaultImage}
                    alt="The Crochet Corner Story"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[var(--color-accent)] rounded-3xl -z-10 hidden md:block opacity-30"></div>
            </div>

            <div className="w-full lg:w-1/2">
              <span className="text-[var(--color-primary)] font-medium uppercase tracking-[0.2em] mb-4 block">Crafting Excellence</span>
              <h2 className="text-3xl md:text-5xl font-serif text-[var(--color-text-main)] mb-4 sm:mb-8 leading-tight">
                Every Stitch is a Labor of Love
              </h2>
              <div className="space-y-3 sm:space-y-6 text-[var(--color-text-muted)] leading-relaxed">
                <p>
                  The Crochet Corner started with a simple vision: to bring the timeless beauty of handmade crafts into modern homes. What began as a personal hobby evolved into a dedicated studio where every item is meticulously crafted by hand.
                </p>
                <p>
                  We believe that in a world of mass production, there's something deeply special about owning a piece that has been touched by human hands. Each flower, bouquet, and accessory we create is unique, carrying the warmth and dedication of the artisan who made it.
                </p>
                <p>
                  Our materials are ethically sourced, and we prioritize premium cotton and wool blends to ensure that your crochet treasures last for years to come.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Values Section */}
      <section className="py-10 sm:py-12 lg:py-24 bg-[var(--color-background)]">
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-12 text-center">
            {[
              { icon: <Heart className="mx-auto mb-4 text-[var(--color-primary)]" />, title: "Handmade", desc: "100% manually crafted" },
              { icon: <Users className="mx-auto mb-4 text-[var(--color-primary)]" />, title: "Community", desc: "Supporting local artisans" },
              { icon: <Sparkles className="mx-auto mb-4 text-[var(--color-primary)]" />, title: "Quality", desc: "Premium yarn selection" },
              { icon: <Award className="mx-auto mb-4 text-[var(--color-primary)]" />, title: "Unique", desc: "No two pieces are identical" }
            ].map((value, i) => (
              <div key={i}>
                {value.icon}
                <h3 className="font-serif text-xl text-[var(--color-text-main)] mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 lg:py-24">
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="bg-[var(--color-primary)] rounded-[3rem] p-8 sm:p-12 md:p-20 text-center text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">Ready to bring some handmade warmth into your life?</h2>
              <Link href="/shop" className="bg-white text-[var(--color-primary)] px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block text-lg">
                Browse Our Collection
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-5 rounded-full"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-white opacity-5 rounded-full"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
