import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  email: string;
  name?: string;
  id?: string;
  user_id?: string;
  timezone?: string | null;
  days_of_week?: string[] | null;
  study_times?: string[] | null;
  education_level?: string | null;
  subjects?: string[] | null;
  study_style?: string | null;
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
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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
        set({ authUser });
        // Fetch full user profile from Users table
        const supabase = createClient();
        const { data: dbUser, error } = await supabase
          .from("Users")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        if (error || !dbUser) {
          // Fallback to auth user data
           const userProfile: UserProfile = {
             id: authUser.id,
             user_id: authUser.id,
             email: authUser.email || "",
             name:
               authUser.user_metadata?.name ||
               authUser.email?.split("@")[0] ||
               undefined,
             timezone: null,
             days_of_week: null,
             study_times: null,
             education_level: null,
             subjects: null,
             study_style: null,
           };
           set({ user: userProfile, isLoading: false, isInitialized: true });
        } else {
          const userProfile: UserProfile = {
            id: dbUser.id,
            user_id: dbUser.user_id,
            email: dbUser.email,
            name: dbUser.name || undefined,
            timezone: dbUser.timezone || null,
            days_of_week: dbUser.days_of_week || null,
            study_times: dbUser.study_times || null,
            education_level: dbUser.education_level || null,
            subjects: dbUser.subjects || null,
            study_style: dbUser.study_style || null,
          };
          set({ user: userProfile, isLoading: false, isInitialized: true });
        }
      } else {
        set({
          user: null,
          authUser: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ authUser: session.user });
          await get().fetchUserProfile();
        } else {
          set({ user: null, authUser: null });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({
        user: null,
        authUser: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, authUser: null });
  },

  fetchUserProfile: async () => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      set({ user: null });
      return;
    }

    // Fetch user profile from Users table
    const { data: dbUser, error } = await supabase
      .from("Users")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    if (error || !dbUser) {
      // Fallback to auth user data
      const userProfile: UserProfile = {
        id: authUser.id,
        user_id: authUser.id,
        email: authUser.email || "",
        name:
          authUser.user_metadata?.name ||
          dbUser?.name ||
          authUser.email?.split("@")[0] ||
          undefined,
        timezone: dbUser?.timezone || null,
        days_of_week: dbUser?.days_of_week || null,
        study_times: dbUser?.study_times || null,
        education_level: dbUser?.education_level || null,
        subjects: dbUser?.subjects || null,
        study_style: dbUser?.study_style || null,
      };
      set({ user: userProfile });
      return;
    }

    const userProfile: UserProfile = {
      id: dbUser.id,
      user_id: dbUser.user_id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      timezone: dbUser.timezone || null,
      days_of_week: dbUser.days_of_week || null,
      study_times: dbUser.study_times || null,
      education_level: dbUser.education_level || null,
      subjects: dbUser.subjects || null,
      study_style: dbUser.study_style || null,
    };
    set({ user: userProfile });
  },

  updateUserProfile: async (data: Partial<UserProfile>) => {
    const supabase = createClient();
    const currentUser = get().user;

    if (!currentUser?.user_id) {
      throw new Error("User not found");
    }

     const { error } = await supabase
       .from("Users")
       .update({
         name: data.name,
         timezone: data.timezone,
         days_of_week: data.days_of_week,
         study_times: data.study_times,
         education_level: data.education_level,
         subjects: data.subjects,
         study_style: data.study_style,
         updated_at: new Date().toISOString(),
       })
       .eq("user_id", currentUser.user_id);

    if (error) {
      throw error;
    }

    // Refresh user profile
    await get().fetchUserProfile();
  },
}));
