import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      role: null,
      loading: true,

      setUser: (user) => set({ user }),
      setUserData: (userData) => set({ userData }),
      setRole: (role) => set({ role }),
      setLoading: (loading) => set({ loading }),

      initAuth: () => {
        let unsubFirestore = null;
        return onAuthStateChanged(auth, async (user) => {
          if (unsubFirestore) unsubFirestore();

          if (user) {
            set({ user, loading: true });
            unsubFirestore = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                set({
                  role: data.role || "user",
                  userData: data,
                  loading: false
                });
              } else {
                set({ role: "user", userData: null, loading: false });
              }
            }, (error) => {
              console.error("Error fetching user data:", error);
              set({ role: "user", userData: null, loading: false });
            });
          } else {
            set({ user: null, role: null, userData: null, loading: false });
          }
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ role: state.role }), // Only persist the role for faster redirection
    }
  )
);
