"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const fallbackImage = "https://images.unsplash.com/photo-1605338661642-cc019ba2f9ec?q=80&w=600&auto=format&fit=crop";

  return (
    <div 
      className="group card flex flex-col h-full bg-white relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="relative h-64 sm:h-80 w-full overflow-hidden block">
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : fallbackImage}
          alt={product.name}
          fill
          className={`object-cover object-center transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Quick view / Add to cart overlay on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full bg-white/95 backdrop-blur text-[var(--color-text-main)] py-3 rounded-full font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-300 shadow-md text-sm"
          >
            Add to Cart
          </button>
        </div>
      </Link>
      
      <Link href={`/product/${product.id}`} className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-medium">
          {product.category}
        </div>
        <h3 className="font-serif text-lg text-[var(--color-text-main)] mb-2 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="mt-auto text-[var(--color-text-main)] font-medium">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </Link>
    </div>
  );
}
