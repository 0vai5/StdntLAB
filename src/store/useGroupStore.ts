import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface UserGroup {
  id: number;
  name: string;
  description: string | null;
  tags: string[] | null;
  is_public: boolean;
  max_members: number;
  owner_id: number;
  created_at: string;
  member_count: number;
  user_role: string;
}

interface GroupState {
  groups: UserGroup[];
  isLoading: boolean;
  isInitialized: boolean;
  currentUserId: number | null; // Track which user's groups are loaded

  // Actions
  initialize: (userId: number) => Promise<void>;
  fetchUserGroups: (userId: number) => Promise<void>;
  refreshGroups: (userId: number) => Promise<void>;
  hasGroups: () => boolean;
  getGroupById: (groupId: number) => UserGroup | undefined;
  addGroup: (group: UserGroup) => void;
  removeGroup: (groupId: number) => void;
  updateGroup: (groupId: number, updates: Partial<UserGroup>) => void;
  clearGroups: () => void;
  leaveGroup: (groupId: number, userId: number) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: false,
  isInitialized: false,
  currentUserId: null,

  initialize: async (userId: number) => {
    const state = get();
    // If already initialized for this user, don't re-fetch
    if (
      state.isInitialized &&
      state.currentUserId === userId &&
      state.groups.length > 0
    ) {
      return;
    }
    // If user changed, clear groups first
    if (state.currentUserId !== null && state.currentUserId !== userId) {
      set({ groups: [], currentUserId: null, isInitialized: false });
    }
    set({ isLoading: true, isInitialized: false });
    await get().fetchUserGroups(userId);
    set({ isLoading: false, isInitialized: true, currentUserId: userId });
  },

  fetchUserGroups: async (userId: number) => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      // Get numeric user ID if userId is a UUID string
      let numericUserId: number;
      if (typeof userId === "string") {
        const { data: userData } = await supabase
          .from("Users")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!userData) {
          set({ groups: [], isLoading: false });
          return;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      // Fetch all groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id, role, joined_at")
        .eq("user_id", numericUserId);

      if (memberError) {
        console.error("Error fetching user groups:", memberError);
        set({ groups: [], isLoading: false, currentUserId: null });
        return;
      }

      if (!memberData || memberData.length === 0) {
        set({ groups: [], isLoading: false, currentUserId: numericUserId });
        return;
      }

      // Get all unique group IDs
      const groupIds = [
        ...new Set(
          memberData
            .map((member) => member.group_id)
            .filter((id): id is number => id !== null)
        ),
      ];

      // Fetch all groups in a single query using 'in' operator
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      if (groupsError || !groupsData) {
        console.error("Error fetching groups:", groupsError);
        set({ groups: [], isLoading: false, currentUserId: null });
        return;
      }

      // Create a map of group_id to member role
      const memberRoleMap = new Map(
        memberData.map((member) => [member.group_id, member.role])
      );

      // Fetch all member counts in parallel (optimized)
      const memberCountPromises = groupIds.map(async (groupId) => {
        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", groupId);
        return { groupId, count: count || 0 };
      });

      const memberCounts = await Promise.all(memberCountPromises);
      const memberCountMap = new Map(
        memberCounts.map(({ groupId, count }) => [groupId, count])
      );

      // Map the data to UserGroup format
      const groupsWithDetails = groupsData
        .map((groupData) => {
          const userRole = memberRoleMap.get(groupData.id);
          if (!userRole) {
            return null;
          }

          return {
            ...groupData,
            member_count: memberCountMap.get(groupData.id) || 0,
            user_role: userRole,
          };
        })
        .filter((group): group is UserGroup => group !== null);

      set({
        groups: groupsWithDetails,
        isLoading: false,
        currentUserId: numericUserId,
      });
    } catch (error) {
      console.error("Error fetching user groups:", error);
      set({ groups: [], isLoading: false, currentUserId: null });
    }
  },

  refreshGroups: async (userId: number) => {
    await get().fetchUserGroups(userId);
  },

  hasGroups: () => {
    return get().groups.length > 0;
  },

  getGroupById: (groupId: number) => {
    return get().groups.find((group) => group.id === groupId);
  },

  addGroup: (group: UserGroup) => {
    set((state) => {
      // Check if group already exists
      if (state.groups.some((g) => g.id === group.id)) {
        return state;
      }
      return { groups: [...state.groups, group] };
    });
  },

  removeGroup: (groupId: number) => {
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    }));
  },

  updateGroup: (groupId: number, updates: Partial<UserGroup>) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));
  },

  clearGroups: () => {
    set({ groups: [], currentUserId: null, isInitialized: false });
  },

  leaveGroup: async (groupId: number, userId: number) => {
    const supabase = createClient();
    
    try {
      // Get numeric user ID if userId is a UUID string
      let numericUserId: number;
      if (typeof userId === "string") {
        const { data: userData } = await supabase
          .from("Users")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!userData) {
          throw new Error("User not found");
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      // Find the group member record
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", numericUserId)
        .single();

      if (memberError || !memberData) {
        throw new Error("Member record not found");
      }

      // Remove member from group_members table
      const { error: deleteError } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberData.id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state by removing the group
      set((state) => ({
        groups: state.groups.filter((group) => group.id !== groupId),
      }));
    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  },
}));
