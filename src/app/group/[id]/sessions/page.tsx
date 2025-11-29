"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { RequestSessionDialog } from "@/components/session/RequestSessionDialog";
import { CreateSessionDialog } from "@/components/session/CreateSessionDialog";
import { RequestDetailsDialog } from "@/components/session/RequestDetailsDialog";
import { SessionDetailsDialog } from "@/components/session/SessionDetailsDialog";
import { OwnerSessionsView } from "@/components/session/OwnerSessionsView";
import { MemberSessionsView } from "@/components/session/MemberSessionsView";
import type { SessionRequest, Session } from "@/store/useSessionStore";

interface Group {
  id: number;
  name: string;
  owner_id: number;
}

export default function GroupSessionsPage() {
  const params = useParams();
  const {
    user,
    sessionRequests,
    sessions,
    sessionRequestsLoading,
    sessionsLoading,
    initializeSessions,
    acceptSessionRequest,
    rejectSessionRequest,
  } = useAllStores();

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(
    null
  );
  const [selectedRequestForDetails, setSelectedRequestForDetails] =
    useState<SessionRequest | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<Session | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);

  const groupId = params.id as string;
  const numericGroupId = parseInt(groupId);

  const numericUserId =
    user && (typeof user.id === "number" ? user.id : parseInt(user.id || "0"));

  const isOwner = group && user && group.owner_id === numericUserId;

  // Fetch group details and initialize sessions
  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || isNaN(numericGroupId)) {
        toast.error("Invalid group ID");
        return;
      }

      // Wait for user to be available
      if (!user || !numericUserId || isNaN(numericUserId)) {
        return;
      }

      setIsLoadingGroup(true);
      try {
        const supabase = createClient();

        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("id, name, owner_id")
          .eq("id", numericGroupId)
          .single();

        if (groupError || !groupData) {
          toast.error("Group not found");
          return;
        }

        setGroup(groupData);

        // Initialize sessions - ensure userId is a number
        const validUserId = typeof numericUserId === "number" 
          ? numericUserId 
          : parseInt(String(numericUserId));
        
        if (!isNaN(validUserId)) {
          await initializeSessions(numericGroupId, validUserId);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
        toast.error("Failed to load group");
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchData();
  }, [groupId, numericGroupId, user, numericUserId, initializeSessions]);

  // Filter requests and sessions
  const myRequests = useMemo(() => {
    if (!numericUserId) return [];
    return sessionRequests.filter(
      (req) => req.requested_by === numericUserId && req.status === "pending"
    );
  }, [sessionRequests, numericUserId]);

  const pendingRequests = useMemo(() => {
    return sessionRequests.filter((req) => req.status === "pending");
  }, [sessionRequests]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0); // Reset seconds and milliseconds for comparison
    
    return sessions.filter((session) => {
      // Only show sessions with "upcoming" status
      if (session.status !== "upcoming") {
        return false;
      }
      
      try {
        let sessionDateTime: Date | null = null;
        
        // Try parsing start_time as ISO timestamp first
        if (session.start_time) {
          sessionDateTime = new Date(session.start_time);
          
          // If invalid, try combining date and start_time
          if (isNaN(sessionDateTime.getTime()) && session.date) {
            // Check if start_time is a full timestamp or just time
            if (session.start_time.includes("T") || session.start_time.includes(" ")) {
              // It's a timestamp format but invalid, skip
              sessionDateTime = null;
            } else {
              // It's likely just time, combine with date
              const timeStr = session.start_time.length === 5 
                ? session.start_time 
                : session.start_time.substring(0, 5);
              sessionDateTime = new Date(`${session.date}T${timeStr}:00`);
            }
          }
        }
        
        // Fallback: use just the date if we have it
        if ((!sessionDateTime || isNaN(sessionDateTime.getTime())) && session.date) {
          sessionDateTime = new Date(session.date);
          sessionDateTime.setHours(0, 0, 0, 0);
        }
        
        // If we still don't have a valid date, show the session anyway if status is upcoming
        if (!sessionDateTime || isNaN(sessionDateTime.getTime())) {
          console.warn("Invalid session date/time:", session);
          return true; // Show it anyway if status is upcoming
        }
        
        // Compare: session should be in the future
        return sessionDateTime >= now;
      } catch (error) {
        console.error("Error filtering session:", error, session);
        // On error, still show if status is upcoming
        return true;
      }
    });
  }, [sessions]);

  const handleAcceptRequest = async (request: SessionRequest) => {
    setSelectedRequest(request);
    setIsCreateDialogOpen(true);
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectSessionRequest(requestId);
      toast.success("Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return dateTimeString; // Return original if invalid
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeString;
    }
  };

  if (isLoadingGroup || sessionRequestsLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!group || !user) {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Manage study sessions for this group
        </p>
      </div>

      {isOwner ? (
        <OwnerSessionsView
          pendingRequests={pendingRequests}
          upcomingSessions={upcomingSessions}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onShowRequestDetails={(request) => {
            setSelectedRequestForDetails(request);
            setIsRequestDetailsOpen(true);
          }}
          onShowSessionDetails={(session) => {
            setSelectedSessionForDetails(session);
            setIsSessionDetailsOpen(true);
          }}
          onCreateSession={() => {
            setSelectedRequest(null);
            setIsCreateDialogOpen(true);
          }}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      ) : (
        <MemberSessionsView
          myRequests={myRequests}
          upcomingSessions={upcomingSessions}
          onShowRequestDetails={(request) => {
            setSelectedRequestForDetails(request);
            setIsRequestDetailsOpen(true);
          }}
          onShowSessionDetails={(session) => {
            setSelectedSessionForDetails(session);
            setIsSessionDetailsOpen(true);
          }}
          onRequestSession={() => setIsRequestDialogOpen(true)}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}

      {/* Dialogs */}
      {numericUserId && !isNaN(numericUserId) && (
        <>
          <RequestSessionDialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
            groupId={numericGroupId}
            userId={numericUserId}
            onSuccess={() => {
              // Refresh will happen automatically via store
            }}
          />

          <CreateSessionDialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setSelectedRequest(null);
              }
            }}
            groupId={numericGroupId}
            userId={numericUserId}
            request={selectedRequest}
            onSuccess={() => {
              // Refresh will happen automatically via store
            }}
          />
        </>
      )}

      {/* Details Dialogs */}
      <RequestDetailsDialog
        open={isRequestDetailsOpen}
        onOpenChange={setIsRequestDetailsOpen}
        request={selectedRequestForDetails}
      />

      <SessionDetailsDialog
        open={isSessionDetailsOpen}
        onOpenChange={setIsSessionDetailsOpen}
        session={selectedSessionForDetails}
      />
    </div>
  );
}
