"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Check,
  X,
  Video,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import type { SessionRequest, Session } from "@/store/useSessionStore";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";

interface OwnerSessionsViewProps {
  pendingRequests: SessionRequest[];
  upcomingSessions: Session[];
  onAcceptRequest: (request: SessionRequest) => void;
  onRejectRequest: (requestId: number) => void;
  onShowRequestDetails: (request: SessionRequest) => void;
  onShowSessionDetails: (session: Session) => void;
  onCreateSession: () => void;
  formatDate: (dateString: string) => string;
  formatTime: (dateTimeString: string) => string;
}

export function OwnerSessionsView({
  pendingRequests,
  upcomingSessions,
  onAcceptRequest,
  onRejectRequest,
  onShowRequestDetails,
  onShowSessionDetails,
  onCreateSession,
  formatDate,
  formatTime,
}: OwnerSessionsViewProps) {
  return (
    <>
      {/* Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Requests</h2>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="p-6">
            <Empty>
              <EmptyMedia>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Session Requests</EmptyTitle>
                <EmptyDescription>
                  There are no pending session requests for this group.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold break-words">{request.topic}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {request.status}
                      </Badge>
                    </div>
                    {/* Show limited info on mobile, full info on desktop */}
                    <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 shrink-0">
                        <User className="h-4 w-4" />
                        <span className="truncate">{request.requester_name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-4 w-4" />
                        <span className="whitespace-nowrap">
                          {formatDate(request.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-4 w-4" />
                        <span className="whitespace-nowrap">
                          {formatTime(request.start_time)} -{" "}
                          {formatTime(request.end_time)}
                        </span>
                      </div>
                    </div>
                    {/* Mobile: Show only topic and status */}
                    <div className="sm:hidden text-sm text-muted-foreground">
                      <p className="truncate">{request.requester_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShowRequestDetails(request)}
                      className="sm:hidden flex-1"
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRejectRequest(request.id)}
                      className="flex-1 sm:flex-initial"
                    >
                      <X className="h-4 w-4 sm:mr-1" />
                      <span className="sm:inline hidden">Decline</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAcceptRequest(request)}
                      className="flex-1 sm:flex-initial"
                    >
                      <Check className="h-4 w-4 sm:mr-1" />
                      <span className="sm:inline hidden">Accept</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 && (
            <Button onClick={onCreateSession}>
              <Plus className="h-4 w-4 mr-2" />
              Organize Session
            </Button>
          )}
        </div>

        {upcomingSessions.length === 0 ? (
          <Card className="p-6">
            <Empty>
              <EmptyMedia>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Upcoming Sessions</EmptyTitle>
                <EmptyDescription>
                  There are no upcoming sessions scheduled for this group.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onCreateSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Organize Session
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold break-words">{session.topic}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {session.status}
                      </Badge>
                    </div>
                    {/* Show full info on desktop, limited on mobile */}
                    <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 shrink-0">
                        <User className="h-4 w-4" />
                        <span className="truncate">{session.creator_name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-4 w-4" />
                        <span className="whitespace-nowrap">
                          {formatDate(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-4 w-4" />
                        <span className="whitespace-nowrap">
                          {formatTime(session.start_time)} -{" "}
                          {formatTime(session.end_time)}
                        </span>
                      </div>
                      {session.meeting_link && (() => {
                        const platformInfo = detectMeetingPlatform(
                          session.meeting_link
                        );
                        return (
                          <div className="flex items-center gap-2 shrink-0">
                            {platformInfo.logoPath ? (
                              <div className="relative h-5 w-5 shrink-0">
                                <Image
                                  src={platformInfo.logoPath}
                                  alt={`${platformInfo.name} logo`}
                                  fill
                                  className="object-contain"
                                  sizes="20px"
                                />
                              </div>
                            ) : (
                              <Video className="h-4 w-4 shrink-0" />
                            )}
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                              title={platformInfo.name}
                            >
                              Join {platformInfo.name}
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Mobile: Show only topic and creator */}
                    <div className="sm:hidden text-sm text-muted-foreground">
                      <p className="truncate">{session.creator_name}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShowSessionDetails(session)}
                    className="w-full sm:w-auto shrink-0"
                  >
                    <span className="sm:inline">Details</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Create Session */}
      {upcomingSessions.length > 0 && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
          onClick={onCreateSession}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

