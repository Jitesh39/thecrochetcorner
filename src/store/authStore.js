import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      loading: true,

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setLoading: (loading) => set({ loading }),

      initAuth: () => {
        return onAuthStateChanged(auth, async (user) => {
          if (user) {
            set({ user, loading: true });
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                set({ role: userDoc.data().role || "user" });
              } else {
                set({ role: "user" });
              }
            } catch (error) {
              console.error("Error fetching user role:", error);
              set({ role: "user" });
            }
          } else {
            set({ user: null, role: null });
          }
          set({ loading: false });
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ role: state.role }), // Only persist the role for faster redirection
    }
  )
);
