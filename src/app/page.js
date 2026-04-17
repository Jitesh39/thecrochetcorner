import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Bestsellers from "@/components/Bestsellers";
import OurPromise from "@/components/OurPromise";
import CategorySections from "@/components/CategorySections";
import StudioPromotion from "@/components/StudioPromotion";

export default function Home() {




  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-[var(--color-secondary)] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1615598696883-7be1a224fe81?q=80&w=1600&auto=format&fit=crop"
            alt="Crochet background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-sm md:text-base tracking-[0.2em] font-medium text-[var(--color-primary-dark)] uppercase mb-4 block">Handmade With Love</span>
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-[var(--color-text-main)] mb-6 leading-tight">
            Cozy Crochet Creations
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover our premium collection of handmade flowers, bouquets, and personalized gifts crafted to bring warmth and joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary">
              View Collection
            </Link>
            <Link href="/custom" className="btn-secondary">
              Custom Order
            </Link>
          </div>
        </div>
      </section>

      {/* Bestselling Products Section */}
      <Bestsellers />

      {/* Categories Section */}
      <CategorySections />

      {/* Studio Promotion Section */}
      <StudioPromotion />

      {/* Our Promise Section */}
      <OurPromise />





      {/* Testimonials Section */}
      <section className="py-20 bg-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[var(--color-text-main)] mb-4">Happy Customers</h2>
            <p className="text-[var(--color-text-muted)] italic">"What they say about our handmade creations"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            {[
              { name: "Ananya Sharma", text: "The rose bouquet I ordered was absolutely stunning! It's so well-made and looks exactly like the pictures.", role: "Regular Customer" },
              { name: "Rishabh Malhotra", text: "Got a custom amigurumi for my niece. The quality is top-notch and it's so soft. Best gift ever!", role: "Gift Buyer" },
              { name: "Priya Singh", text: "I love my new crochet beanie. It's cozy, fits perfectly, and the color is exactly what I wanted.", role: "Verified Buyer" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center sm:items-start transition-all duration-300 hover:shadow-md">
                <div className="flex gap-1 mb-6 text-[var(--color-primary)]">
                  {[...Array(5)].map((_, star) => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-[var(--color-text-main)] italic mb-8 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-serif font-bold text-[var(--color-text-main)]">{testimonial.name}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mt-1">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}
