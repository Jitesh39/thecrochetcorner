import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const exists = items.find((i) => i.id === product.id);
        
        if (!exists) {
          set({ items: [...items, product] });
          return true;
        }
        return false;
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },
      
      toggleItem: (product) => {
        const items = get().items;
        const exists = items.find((i) => i.id === product.id);
        
        if (exists) {
          get().removeItem(product.id);
          return false;
        } else {
          get().addItem(product);
          return true;
        }
      },
      
      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
      
      getWishlistCount: () => {
        return get().items.length;
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);
