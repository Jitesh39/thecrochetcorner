"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { PlusCircle, Image as ImageIcon, Package, Check, Trash2, Edit2, Search, X, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "", baseOrderCount: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      }));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Failed to fetch products.");
      setLoading(false);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({
        name: doc.data().name,
        slug: doc.data().slug || doc.data().name.toLowerCase().replace(/\s+/g, '')
      }));
      setCategories(catsData);
      setNewProduct(prev => {
        if (!prev.category && catsData.length > 0) {
          return { ...prev, category: catsData[0].slug };
        }
        return prev;
      });
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 4) {
      setError("You can upload a maximum of 4 images.");
      return;
    }

    setImageFiles(files);
    setError("");

    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setError("Please fill all required fields.");
      return;
    }
    if (!editMode && imageFiles.length < 1) {
      setError("Please upload at least one image for a new product.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let urls = imagePreviews; // Default to existing previews (URLs) if no new files
      
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64Image }),
          });

          const resData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(resData.details || "Image upload failed");
          return resData.url;
        });

        urls = await Promise.all(uploadPromises);
      }

      if (editMode) {
        await updateDoc(doc(db, "products", editId), {
          ...newProduct,
          price: Number(newProduct.price),
          baseOrderCount: Number(newProduct.baseOrderCount) || 0,
          imageUrls: urls,
          imageUrl: urls[0] || "",
          updatedAt: serverTimestamp(),
        });
        setSuccessMessage("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...newProduct,
          price: Number(newProduct.price),
          baseOrderCount: Number(newProduct.baseOrderCount) || 0,
          orderCount: 0,
          imageUrls: urls,
          imageUrl: urls[0] || "",
          createdAt: serverTimestamp(),
        });
        setSuccessMessage("Product added successfully!");
      }

      setSuccess(true);
      resetForm();
      setTimeout(() => { setSuccess(false); setSuccessMessage(""); }, 3000);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setEditId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      baseOrderCount: product.baseOrderCount || "",
    });
    setImageFiles([]); 
    setImagePreviews(product.imageUrls || (product.imageUrl ? [product.imageUrl] : []));
    setError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setNewProduct({ name: "", price: "", category: categories[0]?.slug || "", description: "", baseOrderCount: "" });
    setImageFiles([]);
    setImagePreviews([]);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.error("Error deleting product:", err);
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
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              {editMode ? <Edit2 size={20} className="text-[var(--color-primary)]" /> : <PlusCircle size={20} className="text-[var(--color-primary)]" />}
              {editMode ? "Edit Product" : "Add New Product"}
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center border border-green-100 animate-in fade-in zoom-in duration-300">
                <Check className="mr-2" size={18} /> {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center border border-red-100 animate-in shake duration-300">
                <X className="mr-2" size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Details</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input required type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="md:col-span-1 w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" />
                  <input required type="number" placeholder="Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" />
                  <input type="number" placeholder="Base Order Count (Optional)" value={newProduct.baseOrderCount} onChange={(e) => setNewProduct({ ...newProduct, baseOrderCount: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
                <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all appearance-none cursor-pointer">
                  {categories.length === 0 ? (
                    <option value="" disabled>No categories available</option>
                  ) : (
                    categories.map((cat, idx) => (
                      <option key={idx} value={cat.slug}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Description</label>
                <textarea rows="3" placeholder="Tell customers about this item..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-xl p-3.5 outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Product Media (1-4 images)</label>
                <div className="relative group">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="product-image" />
                  <label htmlFor="product-image" className="flex flex-col items-center justify-center gap-2 w-full min-h-[160px] border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all p-4 overflow-hidden relative">
                    {imagePreviews.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            {preview.startsWith('data:') || preview.startsWith('http') ? (
                              <Image src={preview} alt={`Preview ${idx}`} fill className="object-cover" />
                            ) : (
                              <Image src={preview} alt={`Preview ${idx}`} fill className="object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-gray-300 transition-transform group-hover:scale-110" size={32} />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Select up to 4 images<br/>(uploading replaces existing)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button type="submit" disabled={uploading} className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : (editMode ? "Update Product" : "Create Product")}
                </button>
                {editMode && (
                  <button type="button" onClick={resetForm} disabled={uploading} className="w-full py-4 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-[var(--color-primary)]" />
                <h3 className="font-bold text-gray-800">Inventory Management</h3>
              </div>
              <div className="relative w-full sm:w-auto">
                <input type="text" placeholder="Search products..." className="w-full sm:w-64 bg-gray-50 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-[var(--color-primary)] transition-all" />
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
                    <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium">Loading inventory...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium">No products found.</td></tr>
                  ) : products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                            <Image src={product.imageUrl || "/placeholder.png"} alt={product.name} fill className="object-cover" />
                          </div>
                          <span className="font-bold text-gray-700">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {categories.find(c => c.slug === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">₹{product.price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-orange-50 rounded-lg transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
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
