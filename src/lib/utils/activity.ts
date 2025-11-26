import type { RecentActivity } from "@/lib/types/activity";

/**
 * Format recent activity message into a readable sentence
 */
export function formatActivityMessage(activity: RecentActivity): string {
  const timeAgo = getTimeAgo(activity.created_at);

  switch (activity.type) {
    case "todo_created":
      return `Created todo "${activity.todo_title}" ${timeAgo}`;
    case "todo_completed":
      return `Completed todo "${activity.todo_title}" ${timeAgo}`;
    case "todo_updated":
      return `Updated todo "${activity.todo_title}" ${timeAgo}`;
    case "todo_deleted":
      return `Deleted todo "${activity.todo_title}" ${timeAgo}`;
    default:
      return activity.message;
  }
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
}
