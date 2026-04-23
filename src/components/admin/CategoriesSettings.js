"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Trash2, Plus, Loader2, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesSettings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      setLoading(false);
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category with this name already exists");
      return;
    }

    setAdding(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      await addDoc(collection(db, "categories"), {
        name,
        slug,
        createdAt: serverTimestamp()
      });
      toast.success("Category added successfully");
      setNewCategoryName("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const isUsed = products.some(p => p.category === name);
    if (isUsed) {
      toast.error(`Cannot delete category "${name}" because it is assigned to existing products.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "categories", id));
        toast.success("Category deleted");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete category");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Categories Management</h1>
        <p className="text-sm text-gray-400 font-medium">Manage product categories available in your store.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Category */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus size={20} className="text-[var(--color-primary)]" />
              Add New Category
            </h2>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Flowers"
                className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-medium text-gray-700 focus:bg-white focus:border-[var(--color-primary)] transition-all outline-none"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={adding || !newCategoryName.trim()}
              className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {adding ? <><Loader2 className="animate-spin" size={18} /> Adding...</> : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Tag size={20} className="text-[var(--color-primary)]" />
              Existing Categories
            </h2>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{categories.length} Categories</span>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {categories.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 h-full">
                <Tag size={48} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest mt-4">No categories added</p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[var(--color-primary)]/30 transition-all">
                  <div>
                    <h3 className="font-bold text-gray-800">{category.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">/{category.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete category"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
