import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/types/user";
import { useGroupStore } from "./useGroupStore";

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
    // Clear groups and recommendations when user signs out
    useGroupStore.getState().clearGroups();
    useGroupStore.getState().clearRecommendedGroups();
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
    // Add cache-busting by including updated_at timestamp in query
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
    const authUser = get().authUser;

    if (!currentUser?.user_id && !authUser?.id) {
      throw new Error("User not found");
    }

    const userId = currentUser?.user_id || authUser?.id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    // Get email from current user or auth user
    const email = currentUser?.email || authUser?.email;
    if (!email) {
      throw new Error("User email not found");
    }

    // Check if user record exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from("Users")
      .select("*")
      .eq("user_id", userId)
      .single();

    // If user doesn't exist, create it first with basic info
    if (!existingUser) {
      const name = 
        data.name || 
        currentUser?.name || 
        authUser?.user_metadata?.name || 
        authUser?.email?.split("@")[0] || 
        "";

      const { error: insertError } = await supabase
        .from("Users")
        .insert({
          user_id: userId,
          email: email,
          name: name,
        });

      if (insertError) {
        throw new Error(`Failed to create user record: ${insertError.message}`);
      }
    }

    // Build update object - only include fields that are actually being updated
    const updateData: {
      updated_at: string;
      name?: string;
      timezone?: string | null;
      days_of_week?: string[] | null;
      study_times?: string[] | null;
      education_level?: string | null;
      subjects?: string[] | null;
      study_style?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided (not undefined)
    if (data.name !== undefined) updateData.name = data.name;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.days_of_week !== undefined) updateData.days_of_week = data.days_of_week;
    if (data.study_times !== undefined) updateData.study_times = data.study_times;
    if (data.education_level !== undefined) updateData.education_level = data.education_level;
    if (data.subjects !== undefined) updateData.subjects = data.subjects;
    if (data.study_style !== undefined) updateData.study_style = data.study_style;

    // Optimistically update local state immediately
    const updatedUser: UserProfile = {
      ...currentUser,
      ...data,
      user_id: userId,
      email: email,
    };
    set({ user: updatedUser });

    // Update database (now we know the record exists)
    const { error } = await supabase
      .from("Users")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      // Revert optimistic update on error
      set({ user: currentUser });
      throw error;
    }

    // Fetch fresh data from database to ensure consistency
    // This ensures we have the latest data from the database
    await get().fetchUserProfile();
    
    // Invalidate recommended groups so they refresh with new preferences
    const groupStore = useGroupStore.getState();
    if (groupStore.recommendedGroupsInitialized) {
      groupStore.clearRecommendedGroups();
    }
  },
}));
