"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Home, Briefcase, Phone, Trash2, Edit2, CheckCircle, X, Loader2, MapPinned } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddressesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    isDefault: false,
  });

  // Fetch Addresses
  useEffect(() => {
    if (!user) return;

    const q = collection(db, "users", user.uid, "addresses");
    const unsub = onSnapshot(q, (snapshot) => {
      const addrList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(addrList.sort((a, b) => (b.isDefault ? 1 : -1) - (a.isDefault ? 1 : -1)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ ...address });
    } else {
      setEditingAddress(null);
      setFormData({
        name: user?.displayName || "",
        phone: "",
        pincode: "",
        city: "",
        state: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        isDefault: addresses.length === 0, // Default if it's the first one
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const validate = () => {
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    if (formData.pincode.length !== 6) {
      toast.error("Pincode must be 6 digits");
      return false;
    }
    if (!formData.name || !formData.addressLine1 || !formData.city || !formData.state) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // If setting as default, unset others
      if (formData.isDefault) {
        addresses.forEach(addr => {
          if (addr.isDefault && addr.id !== editingAddress?.id) {
            batch.update(doc(db, "users", user.uid, "addresses", addr.id), { isDefault: false });
          }
        });
      }

      const addressData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingAddress) {
        batch.update(doc(db, "users", user.uid, "addresses", editingAddress.id), addressData);
      } else {
        const newDocRef = doc(collection(db, "users", user.uid, "addresses"));
        batch.set(newDocRef, { ...addressData, createdAt: serverTimestamp() });
      }

      // Sync with main user profile if default or first address
      if (formData.isDefault || addresses.length === 0) {
        batch.update(doc(db, "users", user.uid), {
          phone: formData.phone,
          address: `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ", " : ""}${formData.city}, ${formData.state} - ${formData.pincode}${formData.landmark ? " (Landmark: " + formData.landmark + ")" : ""}`
        });
      }

      await batch.commit();
      toast.success(editingAddress ? "Address updated!" : "Address added!");
      handleCloseModal();
    } catch (error) {
      console.error("Address Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const setAsDefault = async (address) => {
    try {
      const batch = writeBatch(db);
      addresses.forEach(addr => {
        batch.update(doc(db, "users", user.uid, "addresses", addr.id), { isDefault: addr.id === address.id });
      });

      // Sync profile
      batch.update(doc(db, "users", user.uid), {
        phone: address.phone,
        address: `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ", " : ""}${address.city}, ${address.state} - ${address.pincode}`
      });

      await batch.commit();
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to set default");
    }
  };

  const deliverHere = (address) => {
    localStorage.setItem("selectedAddressId", address.id);
    // Sync profile temporarily for the current session flow
    updateDoc(doc(db, "users", user.uid), {
      phone: address.phone,
      address: `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ", " : ""}${address.city}, ${address.state} - ${address.pincode}`
    });
    toast.success("Address selected for delivery!");
    router.back();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Shipping Addresses</h1>
          <p className="text-sm text-gray-400 font-medium">Where should we deliver your handcrafted treasures?</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
            <MapPinned size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800">No Addresses Found</h3>
            <p className="text-xs text-gray-400">Add a delivery location to get started with your orders.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="mt-2 px-8 py-3 bg-gray-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            Add My First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all relative group ${addr.isDefault ? "border-[var(--color-primary)]" : "border-gray-100 hover:border-gray-200"}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${addr.isDefault ? "bg-[var(--color-secondary)] text-[var(--color-primary)]" : "bg-gray-50 text-gray-400"}`}>
                    <MapPin size={16} />
                  </div>
                  {addr.isDefault && (
                    <span className="text-[9px] font-bold text-[var(--color-primary)] bg-[var(--color-secondary)] px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(addr)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-lg transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <p className="font-bold text-gray-800 flex items-center gap-2">
                  {addr.name}
                  <span className="text-[10px] font-normal text-gray-400">| {addr.phone}</span>
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {addr.addressLine1}, {addr.addressLine2 && addr.addressLine2 + ", "}{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                </p>
                {addr.landmark && <p className="text-[10px] italic text-gray-400">Landmark: {addr.landmark}</p>}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => deliverHere(addr)}
                  className="flex-1 py-2.5 bg-gray-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Deliver Here
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => setAsDefault(addr)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">{editingAddress ? "Edit Address" : "Add New Address"}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Receiver Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
                    <input
                      type="tel" required maxLength="10"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address Line 1 (House No, Building) *</label>
                    <input
                      type="text" required
                      value={formData.addressLine1}
                      onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address Line 2 (Area, Street)</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City *</label>
                    <input
                      type="text" required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">State *</label>
                    <input
                      type="text" required
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode *</label>
                    <input
                      type="text" required maxLength="6"
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 mt-8 cursor-pointer group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.isDefault}
                      onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                    />
                    <div className={`w-10 h-6 rounded-full transition-all ${formData.isDefault ? "bg-[var(--color-primary)]" : "bg-gray-200"}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isDefault ? "translate-x-4" : ""}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-gray-800 transition-all">Set as Default Address</span>
                </label>

                <div className="flex gap-4 mt-10">
                  <button
                    type="button" onClick={handleCloseModal}
                    className="flex-1 py-4 border border-gray-200 text-gray-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex-1 py-4 bg-gray-800 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (editingAddress ? "Save Changes" : "Add Address")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
