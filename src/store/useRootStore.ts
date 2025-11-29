import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useTodoStore } from "./useTodoStore";
import { useGroupStore } from "./useGroupStore";
import { useMaterialStore } from "./useMaterialStore";
// import type { StoreApi } from "zustand";
import { UserProfile } from "@/lib/types";
import { User } from "@supabase/supabase-js";

/**
 * Root store that provides access to all Zustand stores
 * This is a unified interface to access all application state
 */
interface RootStore {
  // Access to all stores
  getAuthStore: () => ReturnType<typeof useAuthStore>;

  // Direct state accessors
  getUser: () => UserProfile | null;
  getAuthUser: () => User | null;
  getIsLoading: () => boolean;

  // Actions
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useRootStore = create<RootStore>((_, __) => ({
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
  const todoStore = useTodoStore();
  const groupStore = useGroupStore();
  const materialStore = useMaterialStore();
  const rootStore = useRootStore();

  return {
    // Individual stores
    authStore,
    todoStore,
    groupStore,
    materialStore,
    rootStore,

    // Auth convenience accessors
    user: authStore.user,
    authUser: authStore.authUser,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,

    // Todo convenience accessors
    todos: todoStore.todos,
    recentActivities: todoStore.recentActivities,
    todosLoading: todoStore.isLoading,
    todosInitialized: todoStore.isInitialized,

    // Group convenience accessors
    groups: groupStore.groups,
    groupsLoading: groupStore.isLoading,
    groupsInitialized: groupStore.isInitialized,
    recommendedGroups: groupStore.recommendedGroups,
    recommendedGroupsLoading: groupStore.recommendedGroupsLoading,
    recommendedGroupsInitialized: groupStore.recommendedGroupsInitialized,

    // Material convenience accessors
    groupMaterial: materialStore.groupMaterial,
    materialsLoading: materialStore.isLoading,
    materialsInitialized: materialStore.isInitialized,

    // Auth Actions
    signOut: authStore.signOut,
    initialize: authStore.initialize,
    fetchUserProfile: authStore.fetchUserProfile,
    updateUserProfile: authStore.updateUserProfile,
    setUser: authStore.setUser,
    setAuthUser: authStore.setAuthUser,
    setLoading: authStore.setLoading,

    // Todo Actions
    initializeTodos: todoStore.initialize,
    fetchTodos: todoStore.fetchTodos,
    createTodo: todoStore.createTodo,
    updateTodo: todoStore.updateTodo,
    deleteTodo: todoStore.deleteTodo,
    toggleTodoStatus: todoStore.toggleTodoStatus,
    getTodosByGroup: todoStore.getTodosByGroup,
    getTodosByFilter: todoStore.getTodosByFilter,
    getRecentActivities: todoStore.getRecentActivities,

    // Group Actions
    initializeGroups: groupStore.initialize,
    fetchUserGroups: groupStore.fetchUserGroups,
    refreshGroups: groupStore.refreshGroups,
    hasGroups: groupStore.hasGroups,
    getGroupById: groupStore.getGroupById,
    addGroup: groupStore.addGroup,
    removeGroup: groupStore.removeGroup,
    updateGroup: groupStore.updateGroup,
    initializeRecommendedGroups: groupStore.initializeRecommendedGroups,
    fetchRecommendedGroups: groupStore.fetchRecommendedGroups,
    clearRecommendedGroups: groupStore.clearRecommendedGroups,

    // Material Actions
    initializeMaterials: materialStore.initialize,
    fetchGroupMaterials: materialStore.fetchGroupMaterials,
    refreshGroupMaterials: materialStore.refreshGroupMaterials,
    clearMaterials: materialStore.clearMaterials,
    createMaterial: materialStore.createMaterial,
    updateMaterial: materialStore.updateMaterial,
    deleteMaterial: materialStore.deleteMaterial,
  };
};
