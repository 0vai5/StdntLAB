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
import { Calendar, Clock, Video, CalendarDays, Users, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useAllStores } from "@/store";
import { SessionDetailsDialog } from "@/components/session/SessionDetailsDialog";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";
import type { Session } from "@/store/useSessionStore";

export function DashboardUpcomingSessionsCard() {
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
      <Card className="p-4 md:p-6 w-full">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  // Show up to 2 sessions in the card
  const displaySessions = upcomingSessions.slice(0, 2);

  return (
    <>
      <Card className="p-4 md:p-6 w-full border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Upcoming Sessions</h2>
                <p className="text-xs text-muted-foreground">
                  {upcomingSessions.length > 0
                    ? `${upcomingSessions.length} session${upcomingSessions.length !== 1 ? "s" : ""} scheduled`
                    : "No sessions scheduled"}
                </p>
              </div>
            </div>
            {upcomingSessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/sessions")}
                className="text-xs"
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Content */}
          {upcomingSessions.length === 0 ? (
            <div className="py-6">
              <Empty>
                <EmptyMedia>
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-sm">No Upcoming Sessions</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    You don&apos;t have any upcoming sessions scheduled.
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/sessions")}
                  className="mt-4"
                >
                  View All Sessions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="space-y-3">
              {displaySessions.map((session) => {
                const platformInfo = session.meeting_link
                  ? detectMeetingPlatform(session.meeting_link)
                  : null;

                return (
                  <div
                    key={session.id}
                    className="border rounded-lg p-3 md:p-4 bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Desktop: Show all data in organized manner, no Details button */}
                    <div className="hidden sm:block">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {session.topic}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {session.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {session.group_name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {formatDate(session.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span className="whitespace-nowrap">
                              {formatTime(session.start_time, session.date)} -{" "}
                              {formatTime(session.end_time, session.date)}
                            </span>
                          </div>
                        </div>
                        {session.meeting_link && platformInfo && (
                          <div className="pt-2 border-t">
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium group"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                              <span>Join {platformInfo.name}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile: Show only Details button in organized manner */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <h4 className="font-semibold text-xs truncate">
                              {session.topic}
                            </h4>
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {session.status}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-2.5 w-2.5 mr-1" />
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
                          className="shrink-0 text-xs h-7"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {upcomingSessions.length > 2 && (
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => router.push("/dashboard/sessions")}
                >
                  View All {upcomingSessions.length} Sessions
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        open={isSessionDetailsOpen}
        onOpenChange={setIsSessionDetailsOpen}
        session={selectedSessionForDetails}
      />
    </>
  );
}

