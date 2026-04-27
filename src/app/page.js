"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Bestsellers from "@/components/Bestsellers";
import OurPromise from "@/components/OurPromise";
import CategorySections from "@/components/CategorySections";
import NewArrivals from "@/components/NewArrivals";
import StudioPromotion from "@/components/StudioPromotion";

const heroImages = [
  "/img1.png",
  "/img1.png",
  "/img1.png"
];

const defaultTypingLines = [
  "Crafted with Love, Made to Last",
  "Every Thread, A Story",
  "Handmade with Heart",
  "Where Threads Turn into Memories"
];

function Typewriter({ texts }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === texts[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts]);

  return (
    <span className="inline-block min-h-[1.5em]">
      {texts[index].substring(0, subIndex)}
      <span className="animate-pulse border-r-2 border-[var(--color-primary)] ml-1"></span>
    </span>
  );
}

export default function Home() {
  const [slides, setSlides] = useState(heroImages.map(url => ({ type: "image", url })));
  const [typingLines, setTypingLines] = useState(defaultTypingLines);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "hero"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let heroSlides = data.heroSlides || [];
        // Migration: if heroSlides is empty but images exists, migrate it
        if (heroSlides.length === 0 && data.images && data.images.length > 0) {
          heroSlides = data.images.map(url => ({ type: "image", url }));
        }
        if (heroSlides.length > 0) setSlides(heroSlides);
        if (data.typingLines && data.typingLines.length > 0) setTypingLines(data.typingLines);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentImage];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] flex items-center justify-center bg-gray-900 overflow-hidden -mt-[1px] pt-0">
        {/* Background Slider */}
        <AnimatePresence>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 6, ease: "linear" }
            }}
            className="absolute inset-0"
          >
            {activeSlide?.type === "video" ? (
              <video
                src={activeSlide.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <Image
                src={activeSlide?.url || "/img1.png"}
                alt="Crochet background"
                fill
                className="object-cover object-center"
                priority
              />
            )}
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 text-center px-4 w-full flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-6xl font-serif font-medium text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg max-w-4xl mx-auto"
          >
            Cozy Crochet Creations
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl text-white/90 mb-6 sm:mb-8 lg:mb-10 font-medium font-serif h-[3em] flex items-center justify-center"
          >
            <Typewriter texts={typingLines} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-0"
          >
            <Link
              href="/shop"
              className="min-w-[150px] sm:min-w-0 sm:w-auto px-8 py-2.5 sm:px-10 sm:py-3.5 text-sm sm:text-base bg-[var(--color-primary)] text-white rounded-full font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer"
            >
              Shop Now
            </Link>
            <Link
              href="/custom"
              className="min-w-[150px] sm:min-w-0 sm:w-auto px-8 py-2.5 sm:px-10 sm:py-3.5 text-sm sm:text-base bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-gray-900 transition-all text-center whitespace-nowrap cursor-pointer shadow-lg"
            >
              Custom Order
            </Link>
          </motion.div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentImage === idx ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
            />
          ))}
        </div>
      </section>

      {/* Bestselling Products Section */}
      <Bestsellers />

      {/* Categories Section */}
      <CategorySections />

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Studio Promotion Section */}
      <StudioPromotion />

      {/* Our Promise Section */}
      <OurPromise />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
}

function TestimonialsSection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "testimonials"), (docSnap) => {
      if (docSnap.exists()) {
        setEntries(docSnap.data().entries || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isHovered || entries.length <= 1) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const intervalTime = isMobile ? 2500 : 3500;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % entries.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isHovered, entries.length]);

  if (loading || entries.length === 0) return null;

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % entries.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + entries.length) % entries.length);

  return (
    <section className="w-full px-6 sm:px-12 lg:px-20 py-6 sm:py-10 bg-[#faf9f8] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl md:text-4xl font-serif text-[var(--color-text-main)] mb-3 font-medium">Happy Customers</h2>
          <p className="text-sm text-[var(--color-text-muted)] italic">"What they say about our handmade creations"</p>
        </div>

        <div
          className="relative w-full flex flex-col items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slider Container */}
          <div className="relative w-full h-[350px] flex justify-center items-center">
            {entries.map((testimonial, i) => {
              let diff = i - activeIndex;
              if (diff > Math.floor(entries.length / 2)) diff -= entries.length;
              if (diff < -Math.floor(entries.length / 2)) diff += entries.length;

              const isActive = diff === 0;

              return (
                <motion.div
                  key={i}
                  animate={{
                    x: `calc(${diff * 110}%)`,
                    scale: isActive ? 1 : 0.9,
                    opacity: isActive ? 1 : (Math.abs(diff) === 1 ? 0.4 : 0),
                    zIndex: isActive ? 10 : 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute top-0 w-[85%] max-w-[350px] h-[360px]"
                  style={{ pointerEvents: Math.abs(diff) <= 1 ? "auto" : "none", willChange: "transform, opacity" }}
                  onClick={() => setActiveIndex(i)}
                  whileHover={isActive ? { y: -8 } : {}}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -40) {
                      nextSlide();
                    } else if (swipe > 40) {
                      prevSlide();
                    }
                  }}
                >
                  <div className="bg-white w-full h-full rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden group">
                    {/* Decorative Corner Accents */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-[4rem] -z-0 transition-transform duration-500 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50/50 rounded-tr-[4rem] -z-0 transition-transform duration-500 group-hover:scale-110"></div>

                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mb-4 z-10 flex-shrink-0 bg-red-100">
                      <Image
                        src={testimonial.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}&backgroundColor=fca5a5,fcd34d,f87171`}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h4 className="font-serif font-bold text-[var(--color-text-main)] text-xl mb-1 z-10">{testimonial.name}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-bold mb-4 z-10">{testimonial.product}</p>

                    <p className="text-gray-600 italic mb-auto leading-relaxed text-sm z-10 line-clamp-4 px-2">"{testimonial.text}"</p>

                    <div className="flex gap-1 mt-6 text-yellow-400 z-10">
                      {[...Array(testimonial.rating || 5)].map((_, star) => (
                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6 mt-8">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {entries.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${activeIndex === i ? "w-8 bg-[var(--color-primary)]" : "w-2 bg-gray-200 hover:bg-gray-300"}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
