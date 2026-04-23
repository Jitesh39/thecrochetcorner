"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, CheckCircle, Loader2, MapPin, Plus, Edit2, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment, onSnapshot, query } from "firebase/firestore";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, loading: authLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [mounted, authLoading, user, router]);

  // Fetch Addresses
  useEffect(() => {
    if (!user) return;
    const q = collection(db, "users", user.uid, "addresses");
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(list);

      // Auto select default
      const defaultAddr = list.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (list.length > 0) setSelectedAddressId(list[0].id);
    });
    return () => unsub();
  }, [user]);

  if (!mounted || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
    </div>
  );

  if (items.length === 0 && !ordered) {
    router.push("/cart");
    return null;
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user || !items.length) return;
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacing(true);
    
    try {
      const orderId = `ORD-${Date.now()}`;
      
      // 1. Prepare Order Data
      const orderData = {
        orderId: orderId,
        userId: user.uid,
        customerName: selectedAddress.name,
        customerEmail: user.email,
        customerPhone: selectedAddress.phone,
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          landmark: selectedAddress.landmark || ""
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.imageUrl || (item.images && item.images[0]) || "",
          isCustom: item.isCustom || false,
          color: item.color || null,
          size: item.size || null,
          type: item.type || null
        })),
        totalAmount: getCartTotal(),
        status: "Confirmed",
        orderStatus: "confirmed",
        paymentStatus: "paid", // Razorpay integration would go here
        createdAt: serverTimestamp(),
      };

      // 2. Save to Firestore (Atomic Batch Approach)
      const batch = writeBatch(db);
      
      // Create Order
      const newOrderRef = doc(collection(db, "orders"));
      batch.set(newOrderRef, orderData);

      // Create Admin Notification
      const notificationRef = doc(collection(db, "notifications"));
      batch.set(notificationRef, {
        orderId: newOrderRef.id,
        userId: user.uid,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount,
        productNames: items.map(i => i.name).join(", "),
        isRead: false,
        type: "new-order",
        createdAt: serverTimestamp()
      });

      // Update Product Order Counts & Clear Firestore Cart
      items.forEach(item => {
        if (!item.isCustom) {
          const productRef = doc(db, "products", item.id);
          batch.update(productRef, {
            orderCount: increment(item.quantity)
          });
        }
        // Clear this item from Firestore cart
        const cartItemRef = doc(db, "carts", user.uid, "items", item.id);
        batch.delete(cartItemRef);
      });

      await batch.commit();

      // 3. Local Success UI
      clearCart();
      toast.success("Order placed successfully! 🧶");
      setOrdered(true);
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Failed to place order. Please check your connection.");
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
          <h1 className="text-3xl font-serif text-[var(--color-text-main)] mb-4">Order Placed!</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            Thank you for shopping with us! Your order has been placed successfully. You can track your handcrafted treasures in your account.
          </p>
          <button onClick={() => router.push("/account/orders")} className="btn-primary w-full py-4">
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Address Selection Section */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-serif text-[var(--color-text-main)]">Select Delivery Address</h2>
                <button
                  onClick={() => router.push("/account/addresses")}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <MapPin className="mx-auto text-gray-300 mb-4" size={40} />
                  <p className="text-sm font-medium text-gray-500 mb-6">No saved addresses found</p>
                  <button onClick={() => router.push("/account/addresses")} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                    Add First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-[var(--color-primary)] bg-[var(--color-secondary)]/10" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--color-text-main)]">{addr.name}</p>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold text-[var(--color-primary)] bg-[var(--color-secondary)] px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>
                          )}
                        </div>
                        {selectedAddressId === addr.id && (
                          <div className="w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{addr.phone}</p>
                      <p className="text-xs text-gray-500 leading-relaxed pr-8">
                        {addr.addressLine1}, {addr.addressLine2 && addr.addressLine2 + ", "}{addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push("/account/addresses"); }}
                        className="absolute bottom-4 right-4 text-gray-400 hover:text-[var(--color-primary)] p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-8 mt-8 border-t border-gray-100">
                <h3 className="text-lg font-medium text-[var(--color-text-main)] mb-4 flex items-center"><CreditCard className="mr-2" size={20} /> Payment Method</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-center text-[var(--color-text-muted)] text-sm">
                  Secured by Razorpay. You'll be redirected to complete your payment securely.
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId}
                className="w-full btn-primary py-4 text-lg flex justify-center items-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 transition-all"
              >
                {placing ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : (
                  <>Pay ₹{getCartTotal().toLocaleString("en-IN")} <Lock size={16} /></>
                )}
              </button>
              {!selectedAddressId && addresses.length > 0 && (
                <p className="text-center text-[10px] text-red-400 font-bold uppercase tracking-widest mt-2">Please select a delivery address</p>
              )}
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image src={item.image || item.imageUrl || (item.images && item.images[0]) || "/img1.png"} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--color-text-main)] truncate">{item.name}</h4>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.category}</p>
                      {item.isCustom && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded uppercase font-bold">{item.color}</span>
                          <span className="text-[9px] bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded uppercase font-bold">{item.size}</span>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-sm text-[var(--color-text-main)]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-4">
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{getCartTotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-50 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-serif font-bold text-[var(--color-text-main)]">Total</span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tighter">Amount to pay</span>
                    <span className="text-2xl font-serif font-black text-[var(--color-primary)]">₹{getCartTotal().toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
