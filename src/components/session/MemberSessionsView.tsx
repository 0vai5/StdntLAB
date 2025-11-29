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
  Video,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import type { SessionRequest, Session } from "@/store/useSessionStore";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";

interface MemberSessionsViewProps {
  myRequests: SessionRequest[];
  upcomingSessions: Session[];
  onShowRequestDetails: (request: SessionRequest) => void;
  onShowSessionDetails: (session: Session) => void;
  onRequestSession: () => void;
  formatDate: (dateString: string) => string;
  formatTime: (dateTimeString: string) => string;
}

export function MemberSessionsView({
  myRequests,
  upcomingSessions,
  onShowRequestDetails,
  onShowSessionDetails,
  onRequestSession,
  formatDate,
  formatTime,
}: MemberSessionsViewProps) {
  return (
    <>
      {/* Your Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Requests</h2>
        </div>

        {myRequests.length === 0 ? (
          <Card className="p-6">
            <Empty>
              <EmptyMedia>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Session Requests</EmptyTitle>
                <EmptyDescription>
                  You haven't requested any sessions yet.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onRequestSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request a Session
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold break-words">{request.topic}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {request.status}
                      </Badge>
                    </div>
                    {/* Show full info on desktop, limited on mobile */}
                    <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
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
                      <p className="truncate">{formatDate(request.date)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShowRequestDetails(request)}
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

      {/* Upcoming Sessions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
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

      {/* Floating Action Button for Request Session */}
      {myRequests.length > 0 && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
          onClick={onRequestSession}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

