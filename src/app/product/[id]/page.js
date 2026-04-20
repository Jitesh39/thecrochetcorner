"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Minus, Plus, Heart, Share2, ChevronRight, Star, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          // Fetch Related Products (same category)
          if (productData.category) {
            const q = query(
              collection(db, "products"),
              where("category", "==", productData.category),
              limit(6)
            );
            const querySnapshot = await getDocs(q);
            const related = querySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(p => p.id !== id);
            setRelatedProducts(related);
          }
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
      setSelectedImage(0); // Reset image selection on product change
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto animate-pulse flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 h-[500px] bg-gray-100 rounded-2xl"></div>
        <div className="w-full md:w-1/2 space-y-6 pt-10">
          <div className="h-4 bg-gray-100 w-1/4 rounded"></div>
          <div className="h-10 bg-gray-100 w-3/4 rounded"></div>
          <div className="h-8 bg-gray-100 w-1/3 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-32">Product not found.</div>;

  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [product.imageUrl || "/placeholder.png"];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success("Added to cart!");
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please Sign In to Use Wishlist", {
        icon: '🔒',
        duration: 4000
      });
      return;
    }
    
    const added = toggleItem(product);
    if (added) {
      toast.success("Added to wishlist!", { icon: '❤️' });
    } else {
      toast.success("Removed from wishlist");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this amazing handmade ${product.name} at The Crochet Corner!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", { icon: '🔗' });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs md:text-sm text-gray-400 mb-8 md:mb-12">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop Collection</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 truncate font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left: Image Gallery (Narrower) */}
          <div className="w-full lg:w-[40%] space-y-6">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx ? 'border-[var(--color-primary)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Content (Wider) */}
          <div className="w-full lg:w-[60%] flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest rounded-full">
                {product.category || "Handmade"}
              </span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-sm text-gray-400 font-medium">Inclusive of all taxes</span>
            </div>

            <div className="space-y-6 mb-10">
              <div className="prose prose-sm text-gray-500 max-w-none leading-relaxed">
                <p>{product.description || "Individually handcrafted with the finest cotton yarn. Each piece is unique and made with meticulous attention to detail."}</p>
              </div>

              {/* Delivery Info Mini Cards */}
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)]">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Shipping</p>
                    <p className="text-xs font-bold text-gray-700">3-5 Days</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)]">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Authentic</p>
                    <p className="text-xs font-bold text-gray-700">100% Cotton</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between border border-gray-100 rounded-2xl bg-gray-50 p-2 w-full sm:w-min min-w-[140px]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-400 hover:text-[var(--color-primary)] rounded-xl hover:bg-white active:scale-90 transition-all cursor-pointer"><Minus size={18} /></button>
                  <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-400 hover:text-[var(--color-primary)] rounded-xl hover:bg-white active:scale-90 transition-all cursor-pointer"><Plus size={18} /></button>
                </div>

                <button onClick={handleAddToCart} className="flex-1 py-4 px-8 rounded-2xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all text-lg cursor-pointer">Add to Cart</button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex gap-4">
                  <button 
                    onClick={handleWishlist}
                    className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${isInWishlist(product?.id) ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-[var(--color-primary)]"}`}
                  >
                    <Heart size={16} fill={isInWishlist(product?.id) ? "currentColor" : "none"} strokeWidth={isInWishlist(product?.id) ? 0 : 2} /> 
                    WISH LIST
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all cursor-pointer"
                  >
                    <Share2 size={16} /> SHARE
                  </button>
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">SKU: CR-{product.id.slice(0, 4).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Love Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 lg:mt-32">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-10">You May Also Love</h3>

            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="min-w-[70%] sm:min-w-[30%] lg:min-w-[20%] snap-start group"
                >
                  <div className="aspect-[3/4] rounded-[1.5rem] bg-gray-50 border border-gray-100 overflow-hidden mb-4 relative transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                    <Image
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="text-sm font-serif font-bold text-gray-800 mb-1 group-hover:text-[var(--color-primary)] transition-colors">{p.name}</h4>
                  <p className="text-sm font-bold text-gray-400">₹{p.price}</p>
                </Link>
              ))}
            </div>

            {/* Scroll Indicator (Mockup) */}
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-[var(--color-primary)]/30 w-1/2"></div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
