"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Session } from "@/store/useSessionStore";
import { detectMeetingPlatform } from "@/lib/utils/meeting-platform";

interface SessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

export function SessionDetailsDialog({
  open,
  onOpenChange,
  session,
}: SessionDetailsDialogProps) {
  if (!session) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
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
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  const platformInfo = session.meeting_link
    ? detectMeetingPlatform(session.meeting_link)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{session.topic}</span>
            <Badge variant="secondary">{session.status}</Badge>
          </DialogTitle>
          <DialogDescription>Session details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Organized By
                </p>
                <p className="text-sm">{session.creator_name || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date
                </p>
                <p className="text-sm">{formatDate(session.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time
                </p>
                <p className="text-sm">
                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </p>
              </div>
            </div>

            {session.meeting_link && (
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Meeting Link
                  </p>
                  <div className="flex items-center gap-2">
                    {platformInfo?.logoPath && (
                      <div className="relative h-5 w-5 shrink-0">
                        <Image
                          src={platformInfo.logoPath}
                          alt={`${platformInfo.name} logo`}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 sm:flex-initial"
                    >
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <span>Join {platformInfo?.name || "Meeting"}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {session.topic && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Topic
              </p>
              <p className="text-sm">{session.topic}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

