"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { PlusCircle, Image as ImageIcon, Package, Check, Trash2, Search, X, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Flowers", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData.sort((a,b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Failed to fetch products.");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !imageFile) {
      setError("Please fill all fields and select an image.");
      return;
    }
    
    setUploading(true);
    setError("");

    try {
      // Step 1: Upload to Cloudinary via backend API
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { url } = await uploadRes.json();

      // Step 2: Store in Firestore
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        imageUrl: url,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setNewProduct({ name: "", price: "", category: "Flowers", description: "" });
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Products</h1>
        <p className="text-sm text-gray-400 font-medium">Add, edit, or remove items from your store inventory.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
               <PlusCircle size={20} className="text-[var(--color-primary)]" />
               Add New Product
            </h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center border border-green-100 animate-in fade-in zoom-in duration-300">
                <Check className="mr-2" size={18} /> Product added successfully!
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center border border-red-100 animate-in shake duration-300">
                <X className="mr-2" size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Details</label>
                <input 
                   required 
                   type="text" 
                   placeholder="Product Name" 
                   value={newProduct.name} 
                   onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                   className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" 
                />
                <input 
                   required 
                   type="number" 
                   placeholder="Price (₹)" 
                   value={newProduct.price} 
                   onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                   className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
                <select 
                   value={newProduct.category} 
                   onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                   className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all appearance-none cursor-pointer"
                >
                  <option value="Flowers">Flowers</option>
                  <option value="Bouquets">Bouquets</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Description</label>
                <textarea 
                   rows="3" 
                   placeholder="Tell customers about this item..."
                   value={newProduct.description} 
                   onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                   className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Media</label>
                <div className="relative group">
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden" 
                      id="product-image"
                   />
                   <label 
                      htmlFor="product-image" 
                      className="flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative"
                   >
                     {imagePreview ? (
                       <>
                         <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                         </div>
                       </>
                     ) : (
                       <>
                         <ImageIcon className="text-gray-300 transition-transform group-hover:scale-110" size={32} />
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Product Photo</span>
                       </>
                     )}
                   </label>
                </div>
              </div>

              <button 
                 type="submit" 
                 disabled={uploading} 
                 className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : "Create Product"}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                   <Package size={20} className="text-[var(--color-primary)]" />
                   <h3 className="font-bold text-gray-800">Inventory Management</h3>
                </div>
                <div className="relative w-full sm:w-auto">
                   <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="w-full sm:w-64 bg-gray-50 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" 
                   />
                   <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                   <tr>
                     <th className="px-6 py-4">Product</th>
                     <th className="px-6 py-4">Category</th>
                     <th className="px-6 py-4">Price</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {loading ? (
                     <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-medium">Loading inventory...</td></tr>
                   ) : products.length === 0 ? (
                     <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-medium">No products found.</td></tr>
                   ) : products.map((product) => (
                     <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                              {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full"><ImageIcon size={16} className="text-gray-300"/></div>
                              )}
                           </div>
                           <span className="font-bold text-gray-700">{product.name}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">{product.category}</span>
                       </td>
                       <td className="px-6 py-4 font-bold text-gray-800">₹{product.price}</td>
                       <td className="px-6 py-4 text-right">
                         <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                         >
                           <Trash2 size={18} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
