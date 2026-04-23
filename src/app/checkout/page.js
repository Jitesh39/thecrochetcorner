"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, CheckCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment } from "firebase/firestore";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, loading: authLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [placing, setPlacing] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "", notes: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [mounted, authLoading, user, router]);

  if (!mounted || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
    </div>
  );

  if (items.length === 0 && !ordered) {
    router.push("/cart");
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) return;

    setPlacing(true);
    
    try {
      // 1. Prepare Order Data
      const orderData = {
        userId: user.uid,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || item.imageUrl || ""
        })),
        totalAmount: getCartTotal(),
        status: "Pending",
        createdAt: serverTimestamp(),
        notes: formData.notes
      };

      // 2. Save to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // 3. Create Admin Notification
      await addDoc(collection(db, "notifications"), {
        orderId: orderRef.id,
        userId: user.uid,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        totalAmount: orderData.totalAmount,
        productNames: items.map(i => i.name).join(", "),
        isRead: false,
        type: "new-order",
        createdAt: serverTimestamp()
      });

      // 4. Update Product Order Counts
      const batch = writeBatch(db);
      items.forEach(item => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, {
          orderCount: increment(item.quantity)
        });
      });
      await batch.commit();

      // 5. Success UI
      setOrdered(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl p-10 text-center shadow-lg border border-gray-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-serif text-[var(--color-text-main)] mb-4">Thank You!</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            Your order has been placed successfully. We've received your request and our team will start processing it soon.
          </p>
          <button onClick={() => router.push("/account/orders")} className="btn-primary w-full py-4">
            Track My Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Checkout Form */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-6 pb-4 border-b border-gray-100">Contact & Shipping</h2>
              
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Phone</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">PIN Code</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-medium text-[var(--color-text-main)] mb-4 flex items-center"><CreditCard className="mr-2" size={20} /> Payment</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-center text-[var(--color-text-muted)] text-sm">
                    Secured by Razorpay. You'll be redirected to complete your payment securely.
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={placing}
                  className="w-full btn-primary py-4 text-lg flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    <>Pay ₹{getCartTotal().toLocaleString("en-IN")} <Lock size={16} /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image src={item.images?.[0] || item.imageUrl} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[var(--color-text-main)] line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.category}</p>
                    </div>
                    <div className="font-medium text-sm text-[var(--color-text-main)]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-3 mb-4">
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-[var(--color-text-main)]">Total</span>
                  <span className="text-2xl font-serif text-[var(--color-text-main)]">₹{getCartTotal().toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
