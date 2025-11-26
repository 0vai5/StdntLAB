import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { StoreApi } from "zustand";

/**
 * Root store that provides access to all Zustand stores
 * This is a unified interface to access all application state
 */
interface RootStore {
  // Access to all stores
  getAuthStore: () => ReturnType<typeof useAuthStore>;
  
  // Direct state accessors
  getUser: () => ReturnType<typeof useAuthStore>["user"];
  getAuthUser: () => ReturnType<typeof useAuthStore>["authUser"];
  getIsLoading: () => ReturnType<typeof useAuthStore>["isLoading"];
  
  // Actions
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<ReturnType<typeof useAuthStore>["user"]>) => Promise<void>;
}

export const useRootStore = create<RootStore>((set, get) => ({
  getAuthStore: () => useAuthStore.getState(),
  
  getUser: () => useAuthStore.getState().user,
  getAuthUser: () => useAuthStore.getState().authUser,
  getIsLoading: () => useAuthStore.getState().isLoading,
  
  signOut: async () => {
    await useAuthStore.getState().signOut();
  },
  
  initialize: async () => {
    await useAuthStore.getState().initialize();
  },
  
  fetchUserProfile: async () => {
    await useAuthStore.getState().fetchUserProfile();
  },
  
  updateUserProfile: async (data) => {
    await useAuthStore.getState().updateUserProfile(data);
  },
}));

/**
 * Hook to access all stores in a single call
 * Usage: const { authStore, user, isLoading } = useAllStores()
 */
export const useAllStores = () => {
  const authStore = useAuthStore();
  const rootStore = useRootStore();
  
  return {
    // Individual stores
    authStore,
    rootStore,
    
    // Convenience accessors
    user: authStore.user,
    authUser: authStore.authUser,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,
    
    // Actions
    signOut: authStore.signOut,
    initialize: authStore.initialize,
    fetchUserProfile: authStore.fetchUserProfile,
    updateUserProfile: authStore.updateUserProfile,
    setUser: authStore.setUser,
    setAuthUser: authStore.setAuthUser,
    setLoading: authStore.setLoading,
  };
};

