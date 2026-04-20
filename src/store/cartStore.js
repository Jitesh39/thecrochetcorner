import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { ...product, quantity }];
          }
          return { 
            items: newItems,
            isDrawerOpen: true // Open drawer when item added
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'crochet-cart-storage',
    }
  )
);
