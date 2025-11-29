import { Video, Link as LinkIcon } from "lucide-react";

export type MeetingPlatform = "google-meet" | "zoom" | "teams" | "other";

export interface PlatformInfo {
  platform: MeetingPlatform;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  logoPath?: string; // Path to the logo image in public folder
}

/**
 * Detects the meeting platform from a URL
 */
export function detectMeetingPlatform(url: string): PlatformInfo {
  if (!url) {
    return {
      platform: "other",
      name: "Meeting",
      icon: Video,
      logoPath: undefined,
    };
  }

  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes("meet.google.com") ||
    lowerUrl.includes("google.com/meet")
  ) {
    return {
      platform: "google-meet",
      name: "Google Meet",
      icon: Video,
      logoPath: "/meet.png", // Google Meet logo
    };
  }

  if (lowerUrl.includes("zoom.us") || lowerUrl.includes("zoom.com")) {
    return {
      platform: "zoom",
      name: "Zoom",
      icon: Video,
      logoPath: "/zoom.png", // Zoom logo
    };
  }

  if (
    lowerUrl.includes("teams.microsoft.com") ||
    lowerUrl.includes("teams.live.com")
  ) {
    return {
      platform: "teams",
      name: "Microsoft Teams",
      icon: Video,
      logoPath: "/teams.png", // Microsoft Teams logo
    };
  }

  return {
    platform: "other",
    name: "Meeting",
    icon: LinkIcon,
    logoPath: undefined,
  };
}
