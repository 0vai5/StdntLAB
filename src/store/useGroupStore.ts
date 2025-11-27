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

  // Actions
  initialize: (userId: number) => Promise<void>;
  fetchUserGroups: (userId: number) => Promise<void>;
  refreshGroups: (userId: number) => Promise<void>;
  hasGroups: () => boolean;
  getGroupById: (groupId: number) => UserGroup | undefined;
  addGroup: (group: UserGroup) => void;
  removeGroup: (groupId: number) => void;
  updateGroup: (groupId: number, updates: Partial<UserGroup>) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: false,
  isInitialized: false,

  initialize: async (userId: number) => {
    if (get().isInitialized && get().groups.length > 0) {
      return; // Already initialized and has data
    }
    set({ isLoading: true, isInitialized: false });
    await get().fetchUserGroups(userId);
    set({ isLoading: false, isInitialized: true });
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
        set({ groups: [], isLoading: false });
        return;
      }

      if (!memberData || memberData.length === 0) {
        set({ groups: [], isLoading: false });
        return;
      }

      // Fetch group details for each group
      const groupsWithDetails = await Promise.all(
        memberData.map(async (member) => {
          const { data: groupData, error: groupError } = await supabase
            .from("groups")
            .select("*")
            .eq("id", member.group_id)
            .single();

          if (groupError || !groupData) {
            return null;
          }

          // Get member count for this group
          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", groupData.id);

          return {
            ...groupData,
            member_count: memberCount || 0,
            user_role: member.role,
          };
        })
      );

      // Filter out null values and set groups
      const validGroups = groupsWithDetails.filter(
        (group): group is UserGroup => group !== null
      );
      set({ groups: validGroups, isLoading: false });
    } catch (error) {
      console.error("Error fetching user groups:", error);
      set({ groups: [], isLoading: false });
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
}));

