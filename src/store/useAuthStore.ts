import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  email: string;
  name?: string;
  id?: string;
}

interface AuthState {
  user: UserProfile | null;
  authUser: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserProfile | null) => void;
  setAuthUser: (authUser: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  authUser: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setAuthUser: (authUser) => set({ authUser }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    const supabase = createClient();

    try {
      // Get initial user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const userProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || "",
          name:
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            undefined,
        };
        set({ user: userProfile, authUser, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, authUser: null, isLoading: false, isInitialized: true });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            name:
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              undefined,
          };
          set({ user: userProfile, authUser: session.user });
        } else {
          set({ user: null, authUser: null });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ user: null, authUser: null, isLoading: false, isInitialized: true });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, authUser: null });
  },
}));

