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
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Calendar, Clock, User, Video, Plus, CalendarDays } from "lucide-react";
import Image from "next/image";
import { useAllStores } from "@/store";
import { RequestSessionDialog } from "@/components/session/RequestSessionDialog";
import { CreateSessionDialog } from "@/components/session/CreateSessionDialog";
import { SessionDetailsDialog } from "@/components/session/SessionDetailsDialog";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";
import type { Session } from "@/store/useSessionStore";

interface UpcomingSessionsCardProps {
  groupId: number;
  userId: number;
  isOwner: boolean;
}

export function UpcomingSessionsCard({
  groupId,
  userId,
  isOwner,
}: UpcomingSessionsCardProps) {
  const router = useRouter();
  const {
    sessions,
    sessionsLoading,
    sessionsInitialized,
    initializeSessions,
  } = useAllStores();

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<Session | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);

  // Initialize sessions
  useEffect(() => {
    if (
      !sessionsInitialized &&
      !sessionsLoading &&
      userId &&
      !isNaN(userId) &&
      groupId &&
      !isNaN(groupId)
    ) {
      initializeSessions(groupId, userId);
    }
  }, [groupId, userId, sessionsInitialized, sessionsLoading, initializeSessions]);

  // Filter upcoming sessions
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0);

    return sessions.filter((session) => {
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
  }, [sessions]);

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

  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return dateTimeString;
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeString;
    }
  };

  if (sessionsLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Upcoming Sessions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/group/${groupId}/sessions`)}
            >
              View All
            </Button>
          </div>

          {upcomingSessions.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Upcoming Sessions</EmptyTitle>
                <EmptyDescription>
                  {isOwner
                    ? "There are no upcoming sessions scheduled for this group."
                    : "There are no upcoming sessions scheduled for this group."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={() => {
                    if (isOwner) {
                      setIsCreateDialogOpen(true);
                    } else {
                      setIsRequestDialogOpen(true);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isOwner ? "Organize Session" : "Request a Session"}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => {
                const platformInfo = session.meeting_link
                  ? detectMeetingPlatform(session.meeting_link)
                  : null;

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Desktop: Show all data in organized manner, no Details button */}
                    <div className="hidden sm:block">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{session.topic}</h4>
                          <Badge variant="secondary" className="shrink-0">
                            {session.status}
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
                              {formatTime(session.start_time)} -{" "}
                              {formatTime(session.end_time)}
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
                  </div>
                );
              })}
              {upcomingSessions.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/group/${groupId}/sessions`)}
                >
                  View All {upcomingSessions.length} Sessions
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      {userId && !isNaN(userId) && (
        <>
          <RequestSessionDialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
            groupId={groupId}
            userId={userId}
            onSuccess={() => {
              // Refresh will happen automatically via store
            }}
          />

          <CreateSessionDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            groupId={groupId}
            userId={userId}
            request={null}
            onSuccess={() => {
              // Refresh will happen automatically via store
            }}
          />
        </>
      )}

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        open={isSessionDetailsOpen}
        onOpenChange={setIsSessionDetailsOpen}
        session={selectedSessionForDetails}
      />
    </>
  );
}

