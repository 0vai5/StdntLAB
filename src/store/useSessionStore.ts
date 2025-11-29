import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type SessionStatus = "upcoming" | "completed" | "cancelled";
export type RequestStatus = "pending" | "accepted" | "rejected";

export interface SessionRequest {
  id: number;
  created_at: string;
  updated_at: string;
  group_id: number;
  requested_by: number;
  topic: string;
  date: string;
  start_time: string;
  end_time: string;
  session_id: number | null;
  status: RequestStatus;
  requester_name?: string; // For display purposes
}

export interface Session {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  group_id: number;
  topic: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  request_id: number | null;
  status: SessionStatus;
  creator_name?: string; // For display purposes
}

interface SessionState {
  // Session Requests
  sessionRequests: SessionRequest[];
  sessionRequestsLoading: boolean;
  sessionRequestsInitialized: boolean;
  currentGroupId: number | null;

  // Sessions
  sessions: Session[];
  sessionsLoading: boolean;
  sessionsInitialized: boolean;

  // All User Sessions (from all groups)
  allUserSessions: (Session & { group_name?: string })[];
  allUserSessionsLoading: boolean;
  allUserSessionsInitialized: boolean;

  // Actions
  initialize: (groupId: number, userId: number) => Promise<void>;
  fetchSessionRequests: (groupId: number, userId: number) => Promise<void>;
  fetchSessions: (groupId: number) => Promise<void>;
  fetchAllUserSessions: (userId: number) => Promise<void>;
  createSessionRequest: (
    groupId: number,
    userId: number,
    data: {
      topic: string;
      date: string;
      start_time: string;
      end_time: string;
    }
  ) => Promise<SessionRequest | null>;
  acceptSessionRequest: (
    requestId: number,
    userId: number,
    meetingLink?: string,
    updates?: {
      topic?: string;
      date?: string;
      start_time?: string;
      end_time?: string;
    }
  ) => Promise<Session | null>;
  rejectSessionRequest: (requestId: number) => Promise<boolean>;
  createSession: (
    groupId: number,
    userId: number,
    data: {
      topic: string;
      date: string;
      start_time: string;
      end_time: string;
      meeting_link?: string;
      request_id?: number | null;
    }
  ) => Promise<Session | null>;
  updateSession: (
    sessionId: number,
    updates: Partial<Session>
  ) => Promise<boolean>;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionRequests: [],
  sessionRequestsLoading: false,
  sessionRequestsInitialized: false,
  currentGroupId: null,

  sessions: [],
  sessionsLoading: false,
  sessionsInitialized: false,

  // All User Sessions
  allUserSessions: [],
  allUserSessionsLoading: false,
  allUserSessionsInitialized: false,

  initialize: async (groupId: number, userId: number) => {
    const state = get();
    if (
      state.sessionRequestsInitialized &&
      state.sessionsInitialized &&
      state.currentGroupId === groupId
    ) {
      return;
    }

    if (state.currentGroupId !== null && state.currentGroupId !== groupId) {
      set({
        sessionRequests: [],
        sessions: [],
        currentGroupId: null,
        sessionRequestsInitialized: false,
        sessionsInitialized: false,
      });
    }

    await Promise.all([
      get().fetchSessionRequests(groupId, userId),
      get().fetchSessions(groupId),
    ]);
    set({ currentGroupId: groupId });
  },

  fetchSessionRequests: async (groupId: number, userId: number) => {
    set({ sessionRequestsLoading: true });
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
          set({ sessionRequests: [], sessionRequestsLoading: false });
          return;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      // Fetch session requests for this group
      // If user is owner, get all requests. If member, get only their requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("session_requests")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching session requests:", requestsError);
        set({ sessionRequests: [], sessionRequestsLoading: false });
        return;
      }

      // Get requester names
      const requesterIds = [
        ...new Set(
          (requestsData || [])
            .map((r) => r.requested_by)
            .filter((id): id is number => id !== null)
        ),
      ];

      const requesterNamesMap = new Map<number, string>();
      if (requesterIds.length > 0) {
        const { data: usersData } = await supabase
          .from("Users")
          .select("id, name")
          .in("id", requesterIds);

        if (usersData) {
          usersData.forEach((user) => {
            requesterNamesMap.set(user.id, user.name || "Unknown");
          });
        }
      }

      const requestsWithNames = (requestsData || []).map((request) => ({
        ...request,
        requester_name: requesterNamesMap.get(request.requested_by) || "Unknown",
      }));

      set({
        sessionRequests: requestsWithNames,
        sessionRequestsLoading: false,
        sessionRequestsInitialized: true,
      });
    } catch (error) {
      console.error("Error fetching session requests:", error);
      set({ sessionRequests: [], sessionRequestsLoading: false });
    }
  },

  fetchSessions: async (groupId: number) => {
    set({ sessionsLoading: true });
    const supabase = createClient();

    try {
      // Fetch sessions for this group
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .eq("group_id", groupId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
        set({ sessions: [], sessionsLoading: false });
        return;
      }

      // Get creator names
      const creatorIds = [
        ...new Set(
          (sessionsData || [])
            .map((s) => s.created_by)
            .filter((id): id is number => id !== null)
        ),
      ];

      const creatorNamesMap = new Map<number, string>();
      if (creatorIds.length > 0) {
        const { data: usersData } = await supabase
          .from("Users")
          .select("id, name")
          .in("id", creatorIds);

        if (usersData) {
          usersData.forEach((user) => {
            creatorNamesMap.set(user.id, user.name || "Unknown");
          });
        }
      }

      const sessionsWithNames = (sessionsData || []).map((session) => ({
        ...session,
        creator_name: creatorNamesMap.get(session.created_by) || "Unknown",
      }));

      set({
        sessions: sessionsWithNames,
        sessionsLoading: false,
        sessionsInitialized: true,
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      set({ sessions: [], sessionsLoading: false });
    }
  },

  fetchAllUserSessions: async (userId: number) => {
    set({ allUserSessionsLoading: true });
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
          set({ 
            allUserSessions: [], 
            allUserSessionsLoading: false,
            allUserSessionsInitialized: true,
          });
          return;
        }
        numericUserId = userData.id;
      } else {
        numericUserId = userId;
      }

      // Get all groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", numericUserId);

      if (memberError || !memberData || memberData.length === 0) {
        set({ 
          allUserSessions: [], 
          allUserSessionsLoading: false,
          allUserSessionsInitialized: true,
        });
        return;
      }

      const groupIds = [
        ...new Set(
          memberData
            .map((m) => m.group_id)
            .filter((id): id is number => id !== null)
        ),
      ];

      if (groupIds.length === 0) {
        set({ 
          allUserSessions: [], 
          allUserSessionsLoading: false,
          allUserSessionsInitialized: true,
        });
        return;
      }

      // Fetch all sessions from user's groups
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .in("group_id", groupIds)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (sessionsError) {
        console.error("Error fetching all user sessions:", sessionsError);
        set({ 
          allUserSessions: [], 
          allUserSessionsLoading: false,
          allUserSessionsInitialized: true,
        });
        return;
      }

      // Get group names
      const { data: groupsData } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);

      const groupNamesMap = new Map<number, string>();
      if (groupsData) {
        groupsData.forEach((group) => {
          groupNamesMap.set(group.id, group.name);
        });
      }

      // Get creator names
      const creatorIds = [
        ...new Set(
          (sessionsData || [])
            .map((s) => s.created_by)
            .filter((id): id is number => id !== null)
        ),
      ];

      const creatorNamesMap = new Map<number, string>();
      if (creatorIds.length > 0) {
        const { data: usersData } = await supabase
          .from("Users")
          .select("id, name")
          .in("id", creatorIds);

        if (usersData) {
          usersData.forEach((user) => {
            creatorNamesMap.set(user.id, user.name || "Unknown");
          });
        }
      }

      const sessionsWithDetails = (sessionsData || []).map((session) => ({
        ...session,
        creator_name: creatorNamesMap.get(session.created_by) || "Unknown",
        group_name: groupNamesMap.get(session.group_id) || "Unknown Group",
      }));

      set({
        allUserSessions: sessionsWithDetails,
        allUserSessionsLoading: false,
        allUserSessionsInitialized: true,
      });
    } catch (error) {
      console.error("Error fetching all user sessions:", error);
      set({ 
        allUserSessions: [], 
        allUserSessionsLoading: false,
        allUserSessionsInitialized: true,
      });
    }
  },

  createSessionRequest: async (
    groupId: number,
    userId: number,
    data: {
      topic: string;
      date: string;
      start_time: string;
      end_time: string;
    }
  ) => {
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

      const { data: requestData, error } = await supabase
        .from("session_requests")
        .insert({
          group_id: groupId,
          requested_by: numericUserId,
          topic: data.topic,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          status: "pending",
          session_id: null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh requests
      await get().fetchSessionRequests(groupId, numericUserId);

      return requestData as SessionRequest;
    } catch (error) {
      console.error("Error creating session request:", error);
      throw error;
    }
  },

  acceptSessionRequest: async (
    requestId: number,
    userId: number,
    meetingLink?: string,
    updates?: {
      topic?: string;
      date?: string;
      start_time?: string;
      end_time?: string;
    }
  ) => {
    const supabase = createClient();
    const state = get();

    try {
      // Get the request first
      const { data: request, error: requestError } = await supabase
        .from("session_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        throw new Error("Request not found");
      }

      // Get numeric user ID
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

      // Use updated values if provided, otherwise use request values
      const sessionData = {
        group_id: request.group_id,
        created_by: numericUserId,
        topic: updates?.topic ?? request.topic,
        date: updates?.date ?? request.date,
        start_time: updates?.start_time ?? request.start_time,
        end_time: updates?.end_time ?? request.end_time,
        meeting_link: meetingLink || null,
        request_id: requestId,
        status: "upcoming" as SessionStatus,
      };

      // Create session from request (with optional updates)
      const { data: createdSession, error: sessionError } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("session_requests")
        .update({
          status: "accepted",
          session_id: createdSession.id,
        })
        .eq("id", requestId);

      if (updateError) {
        console.error("Error updating request status:", updateError);
        // Continue anyway
      }

      // Refresh both requests and sessions
      await Promise.all([
        get().fetchSessionRequests(request.group_id, numericUserId),
        get().fetchSessions(request.group_id),
      ]);

      return createdSession as Session;
    } catch (error) {
      console.error("Error accepting session request:", error);
      throw error;
    }
  },

  rejectSessionRequest: async (requestId: number) => {
    const supabase = createClient();
    const state = get();

    try {
      // Get the request to know which group
      const { data: request } = await supabase
        .from("session_requests")
        .select("group_id, requested_by")
        .eq("id", requestId)
        .single();

      const { error } = await supabase
        .from("session_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) {
        throw error;
      }

      // Refresh requests
      if (request) {
        await get().fetchSessionRequests(request.group_id, request.requested_by);
      }

      return true;
    } catch (error) {
      console.error("Error rejecting session request:", error);
      throw error;
    }
  },

  createSession: async (
    groupId: number,
    userId: number,
    data: {
      topic: string;
      date: string;
      start_time: string;
      end_time: string;
      meeting_link?: string;
      request_id?: number | null;
    }
  ) => {
    const supabase = createClient();

    try {
      // Get numeric user ID
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

      const { data: sessionData, error } = await supabase
        .from("sessions")
        .insert({
          group_id: groupId,
          created_by: numericUserId,
          topic: data.topic,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          meeting_link: data.meeting_link || null,
          request_id: data.request_id || null,
          status: "upcoming",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh sessions
      await get().fetchSessions(groupId);

      return sessionData as Session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },

  updateSession: async (sessionId: number, updates: Partial<Session>) => {
    const supabase = createClient();
    const state = get();

    try {
      // Get the session to know which group
      const { data: session } = await supabase
        .from("sessions")
        .select("group_id")
        .eq("id", sessionId)
        .single();

      const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId);

      if (error) {
        throw error;
      }

      // Refresh sessions
      if (session) {
        await get().fetchSessions(session.group_id);
      }

      return true;
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  },

  clearSessions: () => {
    set({
      sessionRequests: [],
      sessions: [],
      currentGroupId: null,
      sessionRequestsInitialized: false,
      sessionsInitialized: false,
    });
  },
}));

