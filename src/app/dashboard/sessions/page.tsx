"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Calendar, Clock, User, Video, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import { useAllStores } from "@/store";
import { SessionDetailsDialog } from "@/components/session/SessionDetailsDialog";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";
import type { Session } from "@/store/useSessionStore";

export default function DashboardSessionsPage() {
  const router = useRouter();
  const {
    user,
    isInitialized,
    isLoading: authLoading,
    allUserSessions,
    allUserSessionsLoading,
    allUserSessionsInitialized,
    fetchAllUserSessions,
  } = useAllStores();

  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<(Session & { group_name?: string }) | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);

  // Initialize and fetch all user sessions
  useEffect(() => {
    if (!isInitialized || authLoading) {
      return;
    }

    if (
      user?.id &&
      !allUserSessionsLoading &&
      !allUserSessionsInitialized
    ) {
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");
      if (!isNaN(numericUserId)) {
        fetchAllUserSessions(numericUserId);
      }
    }
  }, [
    user?.id,
    isInitialized,
    authLoading,
    allUserSessionsLoading,
    allUserSessionsInitialized,
    fetchAllUserSessions,
  ]);

  // Filter upcoming sessions
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0);

    return allUserSessions.filter((session) => {
      if (session.status !== "upcoming") {
        return false;
      }

      try {
        let sessionDateTime: Date | null = null;

        if (session.start_time) {
          sessionDateTime = new Date(session.start_time);

          if (isNaN(sessionDateTime.getTime()) && session.date) {
            if (
              session.start_time.includes("T") ||
              session.start_time.includes(" ")
            ) {
              sessionDateTime = null;
            } else {
              const timeStr =
                session.start_time.length === 5
                  ? session.start_time
                  : session.start_time.substring(0, 5);
              sessionDateTime = new Date(`${session.date}T${timeStr}:00`);
            }
          }
        }

        if ((!sessionDateTime || isNaN(sessionDateTime.getTime())) && session.date) {
          sessionDateTime = new Date(session.date);
          sessionDateTime.setHours(0, 0, 0, 0);
        }

        if (!sessionDateTime || isNaN(sessionDateTime.getTime())) {
          return true;
        }

        return sessionDateTime >= now;
      } catch (error) {
        console.error("Error filtering session:", error, session);
        return true;
      }
    });
  }, [allUserSessions]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
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

  const formatTime = (timeString: string, dateString?: string) => {
    try {
      let date: Date;
      
      // If it's already a full datetime string, use it directly
      if (timeString.includes("T") || timeString.includes(" ")) {
        date = new Date(timeString);
      } else if (dateString) {
        // Combine date and time
        const timeStr = timeString.length === 5 ? timeString : timeString.substring(0, 5);
        date = new Date(`${dateString}T${timeStr}:00`);
      } else {
        // Fallback: try to parse as is
        date = new Date(timeString);
      }
      
      if (isNaN(date.getTime())) {
        return timeString;
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  if (authLoading || allUserSessionsLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarDays className="h-8 w-8" />
          My Sessions
        </h1>
        <p className="text-muted-foreground mt-1">
          All upcoming sessions from your groups
        </p>
      </div>

      {upcomingSessions.length === 0 ? (
        <Card className="p-6">
          <Empty>
            <EmptyMedia>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Upcoming Sessions</EmptyTitle>
              <EmptyDescription>
                You don't have any upcoming sessions scheduled in your groups.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingSessions.map((session) => {
            const platformInfo = session.meeting_link
              ? detectMeetingPlatform(session.meeting_link)
              : null;

            return (
              <Card key={session.id} className="p-4">
                {/* Desktop: Show all data in organized manner, no Details button */}
                <div className="hidden sm:block">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{session.topic}</h4>
                        <Badge variant="secondary" className="shrink-0">
                          {session.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        {session.group_name}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0" />
                        <span className="truncate">{session.creator_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">
                          {formatDate(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">
                          {formatTime(session.start_time, session.date)} -{" "}
                          {formatTime(session.end_time, session.date)}
                        </span>
                      </div>
                      {session.meeting_link && platformInfo && (
                        <div className="flex items-center gap-2">
                          {platformInfo.logoPath ? (
                            <div className="relative h-4 w-4 shrink-0">
                              <Image
                                src={platformInfo.logoPath}
                                alt={`${platformInfo.name} logo`}
                                fill
                                className="object-contain"
                                sizes="16px"
                              />
                            </div>
                          ) : (
                            <Video className="h-4 w-4 shrink-0" />
                          )}
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Join {platformInfo.name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile: Show only Details button in organized manner */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {session.topic}
                        </h4>
                        <Badge variant="secondary" className="shrink-0">
                          {session.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {session.group_name}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionForDetails(session);
                        setIsSessionDetailsOpen(true);
                      }}
                      className="shrink-0"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        open={isSessionDetailsOpen}
        onOpenChange={setIsSessionDetailsOpen}
        session={selectedSessionForDetails}
      />
    </div>
  );
}
