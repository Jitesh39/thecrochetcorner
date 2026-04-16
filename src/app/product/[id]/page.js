"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, Heart, Share2, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto animate-pulse flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 h-[500px] bg-gray-200 rounded-2xl"></div>
        <div className="w-full md:w-1/2 space-y-6 pt-10">
          <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-10 bg-gray-200 w-3/4 rounded"></div>
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="h-32 bg-gray-200 w-full rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-32">Product not found.</div>;

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push("/cart");
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-[var(--color-text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[var(--color-text-main)] truncate font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Main Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--color-secondary)] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl group">
              <Image 
                src={product.imageUrl || "/img1.png"} 
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--color-primary)]">
              {product.category || "Handmade"}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-[var(--color-text-main)] mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl text-[var(--color-text-main)] font-medium mb-6">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            
            <div className="border-t border-gray-100 pt-6 mb-8 text-[var(--color-text-muted)] leading-relaxed">
              <p>{product.description || "A beautiful, carefully handcrafted piece made just for you."}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1 w-max">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded-full"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded-full"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-4 text-lg flex justify-center items-center gap-2 group"
              >
                Add to Cart
              </button>
            </div>

            {/* Extra actions */}
            <div className="flex gap-6 mt-4 pt-6 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors group">
                <Heart size={18} className="group-hover:fill-[var(--color-primary)] transition-colors" /> Add to Wishlist
              </button>
              <button className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                <Share2 size={18} /> Share
              </button>
            </div>

            {/* Accordion / Info */}
            <div className="mt-12 space-y-4">
              <div className="border border-gray-100 rounded-xl p-5 bg-[var(--color-background)]">
                <h3 className="font-serif text-lg text-[var(--color-text-main)] mb-2">Shipping & Returns</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Free shipping on all orders over ₹1500. Each item is handmade to order, please allow 3-5 days for crafting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
