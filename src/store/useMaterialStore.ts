import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Material {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  group_id: number;
  title: string;
  content: string;
}

interface MaterialState {
  groupMaterial: Material[];
  isLoading: boolean;
  isInitialized: boolean;
  currentGroupId: number | null;

  // Actions
  initialize: (groupId: number) => Promise<void>;
  fetchGroupMaterials: (groupId: number) => Promise<void>;
  refreshGroupMaterials: (groupId: number) => Promise<void>;
  clearMaterials: () => void;
  createMaterial: (
    groupId: number,
    userId: number,
    title: string,
    content: string
  ) => Promise<Material | null>;
  updateMaterial: (
    materialId: number,
    title: string,
    content: string
  ) => Promise<boolean>;
  deleteMaterial: (materialId: number) => Promise<boolean>;
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
  groupMaterial: [],
  isLoading: false,
  isInitialized: false,
  currentGroupId: null,

  initialize: async (groupId: number) => {
    const state = get();
    // If already initialized for this group, don't re-fetch
    if (
      state.isInitialized &&
      state.currentGroupId === groupId &&
      state.groupMaterial.length >= 0
    ) {
      return;
    }
    // If group changed, clear materials first
    if (state.currentGroupId !== null && state.currentGroupId !== groupId) {
      set({ groupMaterial: [], currentGroupId: null, isInitialized: false });
    }
    set({ isLoading: true, isInitialized: false });
    await get().fetchGroupMaterials(groupId);
    set({ isLoading: false, isInitialized: true, currentGroupId: groupId });
  },

  fetchGroupMaterials: async (groupId: number) => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      // Fetch all materials for the group
      const { data, error } = await supabase
        .from("material")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching group materials:", error);
        set({ groupMaterial: [], isLoading: false });
        return;
      }

      set({
        groupMaterial: data || [],
        isLoading: false,
        currentGroupId: groupId,
      });
    } catch (error) {
      console.error("Error fetching group materials:", error);
      set({ groupMaterial: [], isLoading: false, currentGroupId: null });
    }
  },

  refreshGroupMaterials: async (groupId: number) => {
    await get().fetchGroupMaterials(groupId);
  },

  clearMaterials: () => {
    set({ groupMaterial: [], currentGroupId: null, isInitialized: false });
  },

  createMaterial: async (
    groupId: number,
    userId: number,
    title: string,
    content: string
  ) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("material")
        .insert({
          group_id: groupId,
          user_id: userId,
          title: title.trim(),
          content: content.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating material:", error);
        throw error;
      }

      // Add to local state if it's for the current group
      const state = get();
      if (state.currentGroupId === groupId && data) {
        set({
          groupMaterial: [data, ...state.groupMaterial],
        });
      }

      return data;
    } catch (error) {
      console.error("Error creating material:", error);
      throw error;
    }
  },

  updateMaterial: async (
    materialId: number,
    title: string,
    content: string
  ) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("material")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", materialId)
        .select()
        .single();

      if (error) {
        console.error("Error updating material:", error);
        throw error;
      }

      // Update local state
      const state = get();
      set({
        groupMaterial: state.groupMaterial.map((material) =>
          material.id === materialId ? data : material
        ),
      });

      return true;
    } catch (error) {
      console.error("Error updating material:", error);
      throw error;
    }
  },

  deleteMaterial: async (materialId: number) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("material")
        .delete()
        .eq("id", materialId);

      if (error) {
        console.error("Error deleting material:", error);
        throw error;
      }

      // Remove from local state
      const state = get();
      set({
        groupMaterial: state.groupMaterial.filter(
          (material) => material.id !== materialId
        ),
      });

      return true;
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  },
}));
