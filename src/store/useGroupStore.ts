import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/user";

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

export interface RecommendedGroup {
  id: number;
  name: string;
  description: string | null;
  tags: string[] | null;
  is_public: boolean;
  max_members: number;
  owner_id: number;
  created_at: string;
  member_count: number;
  match_score?: number; // Relevance score based on preferences
}

interface GroupState {
  groups: UserGroup[];
  isLoading: boolean;
  isInitialized: boolean;
  currentUserId: number | null; // Track which user's groups are loaded

  // Recommended Groups
  recommendedGroups: RecommendedGroup[];
  recommendedGroupsLoading: boolean;
  recommendedGroupsInitialized: boolean;
  recommendedGroupsUserId: number | null; // Track which user's recommendations are loaded

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
  
  // Recommended Groups Actions
  initializeRecommendedGroups: (userId: number, userProfile: UserProfile) => Promise<void>;
  fetchRecommendedGroups: (userId: number, userProfile: UserProfile) => Promise<void>;
  clearRecommendedGroups: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: false,
  isInitialized: false,
  currentUserId: null,

  // Recommended Groups
  recommendedGroups: [],
  recommendedGroupsLoading: false,
  recommendedGroupsInitialized: false,
  recommendedGroupsUserId: null,

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
    // If recommendations are initialized, invalidate them so they refresh with updated joined groups
    const state = get();
    if (state.recommendedGroupsInitialized && state.recommendedGroupsUserId === userId) {
      // Invalidate recommendations - they will be re-fetched when dashboard checks
      set({ recommendedGroupsInitialized: false });
    }
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

  // Recommended Groups Actions
  initializeRecommendedGroups: async (userId: number, userProfile: UserProfile) => {
    const state = get();
    // If already initialized for this user, don't re-fetch
    if (
      state.recommendedGroupsInitialized &&
      state.recommendedGroupsUserId === userId &&
      state.recommendedGroups.length > 0
    ) {
      return;
    }
    // If user changed, clear recommendations first
    if (state.recommendedGroupsUserId !== null && state.recommendedGroupsUserId !== userId) {
      set({ 
        recommendedGroups: [], 
        recommendedGroupsUserId: null, 
        recommendedGroupsInitialized: false 
      });
    }
    set({ recommendedGroupsLoading: true, recommendedGroupsInitialized: false });
    await get().fetchRecommendedGroups(userId, userProfile);
    set({ 
      recommendedGroupsLoading: false, 
      recommendedGroupsInitialized: true, 
      recommendedGroupsUserId: userId 
    });
  },

  fetchRecommendedGroups: async (userId: number, userProfile: UserProfile) => {
    set({ recommendedGroupsLoading: true });
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
          set({ recommendedGroups: [], recommendedGroupsLoading: false });
          return;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      // Get groups the user is already a member of (to exclude them)
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", numericUserId);

      const joinedGroupIds = new Set(
        (memberData || []).map((m) => m.group_id).filter((id): id is number => id !== null)
      );

      // Fetch all public groups
      const { data: allGroups, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .eq("is_public", true);

      if (groupsError || !allGroups) {
        console.error("Error fetching recommended groups:", groupsError);
        set({ recommendedGroups: [], recommendedGroupsLoading: false });
        return;
      }

      // Get member counts for all groups
      const memberCountPromises = allGroups.map(async (group) => {
        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);
        return { groupId: group.id, count: count || 0 };
      });

      const memberCounts = await Promise.all(memberCountPromises);
      const memberCountMap = new Map(
        memberCounts.map(({ groupId, count }) => [groupId, count])
      );

      // Filter groups that user hasn't joined, are not full, and calculate match scores
      const groupsWithScores = allGroups
        .filter((group) => !joinedGroupIds.has(group.id)) // Exclude groups user has joined
        .map((group) => {
          const memberCount = memberCountMap.get(group.id) || 0;
          // Skip if group is full
          if (memberCount >= group.max_members) {
            return null;
          }

          // Calculate match score based on user preferences
          let matchScore = 0;
          const groupTags = group.tags || [];

          // Match subjects (highest weight)
          if (userProfile.subjects && userProfile.subjects.length > 0) {
            const matchingSubjects = userProfile.subjects.filter((subject) =>
              groupTags.some((tag) => tag.toLowerCase().includes(subject.toLowerCase()))
            );
            matchScore += matchingSubjects.length * 10;
          }

          // Match education level
          if (userProfile.education_level && groupTags.length > 0) {
            const educationLevelLower = userProfile.education_level.toLowerCase();
            const hasEducationMatch = groupTags.some((tag) =>
              tag.toLowerCase().includes(educationLevelLower)
            );
            if (hasEducationMatch) matchScore += 5;
          }

          // Match study style
          if (userProfile.study_style && groupTags.length > 0) {
            const studyStyleLower = userProfile.study_style.toLowerCase();
            const hasStyleMatch = groupTags.some((tag) =>
              tag.toLowerCase().includes(studyStyleLower)
            );
            if (hasStyleMatch) matchScore += 3;
          }

          // Boost score for groups with more tags (more descriptive)
          matchScore += groupTags.length * 0.5;

          // Boost score for groups with more members (more active)
          matchScore += memberCount * 0.2;

          return {
            ...group,
            member_count: memberCount,
            match_score: matchScore,
          };
        })
        .filter((group): group is RecommendedGroup => group !== null)
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
        .slice(0, 6); // Limit to top 6 recommendations

      set({
        recommendedGroups: groupsWithScores,
        recommendedGroupsLoading: false,
        recommendedGroupsUserId: numericUserId,
      });
    } catch (error) {
      console.error("Error fetching recommended groups:", error);
      set({ recommendedGroups: [], recommendedGroupsLoading: false });
    }
  },

  clearRecommendedGroups: () => {
    set({ 
      recommendedGroups: [], 
      recommendedGroupsUserId: null, 
      recommendedGroupsInitialized: false 
    });
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

      // Get all quiz IDs for this group
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("id")
        .eq("group_id", groupId);

      const quizIds = quizzesData?.map((q) => q.id) || [];

      // Delete all quiz submissions for this user and group's quizzes
      if (quizIds.length > 0) {
        const { error: submissionsError } = await supabase
          .from("quiz_submission")
          .delete()
          .eq("user_id", numericUserId)
          .in("quiz_id", quizIds);

        if (submissionsError) {
          console.error("Error deleting quiz submissions:", submissionsError);
          // Continue even if this fails
        }
      }

      // Delete all materials created by this user for this group
      const { error: materialsError } = await supabase
        .from("material")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", numericUserId);

      if (materialsError) {
        console.error("Error deleting materials:", materialsError);
        // Continue even if this fails
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
