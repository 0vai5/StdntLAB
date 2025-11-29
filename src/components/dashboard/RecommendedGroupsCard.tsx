"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Users, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAllStores } from "@/store";
import { toast } from "sonner";
import type { RecommendedGroup } from "@/store/useGroupStore";

interface RecommendedGroupsCardProps {
  recommendedGroups: RecommendedGroup[];
  isLoading: boolean;
  isInitialized?: boolean;
}

export function RecommendedGroupsCard({
  recommendedGroups,
  isLoading,
  isInitialized = true,
}: RecommendedGroupsCardProps) {
  const router = useRouter();
  const { user, authUser, refreshGroups, clearRecommendedGroups } = useAllStores();
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  const handleJoinGroup = async (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!user || !authUser) {
      toast.error("You must be logged in to join a group");
      return;
    }

    // Use numeric user ID from store (already available)
    const numericUserId =
      typeof user.id === "number" ? user.id : parseInt(user.id || "0");

    if (!numericUserId || isNaN(numericUserId)) {
      toast.error("User ID not found. Please refresh and try again.");
      return;
    }

    setJoiningGroupId(groupId);

    try {
      const supabase = createClient();

      // Check if group exists and has space
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("max_members")
        .eq("id", groupId)
        .single();

      if (groupError || !groupData) {
        toast.error("Group not found");
        return;
      }

      // Check current member count
      const { count: currentMembers } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      if (currentMembers && currentMembers >= groupData.max_members) {
        toast.error("This group is full");
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", numericUserId)
        .single();

      if (existingMember) {
        toast.info("You are already a member of this group");
        router.push(`/group/${groupId}`);
        return;
      }

      // Add user to group
      const { error: insertError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: numericUserId,
          role: "member",
          joined_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error joining group:", insertError);
        toast.error("Failed to join group. Please try again.");
        return;
      }

      toast.success("Successfully joined the group!");
      
      // Refresh groups store
      if (user?.id) {
        await refreshGroups(Number(user.id));
      }
      
      // Clear recommended groups to refresh them
      clearRecommendedGroups();
      
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group. Please try again.");
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Show loading state if loading or not initialized yet
  if (isLoading || !isInitialized) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (recommendedGroups.length === 0 && !isLoading) {
    return (
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Recommended Groups</h3>
              <p className="text-sm text-muted-foreground">
                Groups matching your preferences
              </p>
            </div>
          </div>
          <Empty>
            <EmptyMedia>
              <Users className="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Recommendations Available</EmptyTitle>
              <EmptyDescription>
                We couldn&apos;t find any groups matching your preferences at the moment.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Recommended Groups</h3>
              <p className="text-sm text-muted-foreground">
                Groups matching your preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {recommendedGroups.slice(0, 3).map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/group/${group.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      {group.name}
                    </h4>
                    {group.match_score && group.match_score > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(group.match_score)}% match
                      </Badge>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {group.member_count} / {group.max_members}
                      </span>
                    </div>
                    {group.tags && group.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {group.tags.slice(0, 2).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {group.tags.length > 2 && (
                          <span className="text-xs">+{group.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleJoinGroup(group.id, e)}
                    disabled={joiningGroupId === group.id}
                    className="shrink-0"
                  >
                    {joiningGroupId === group.id ? (
                      <>
                        <Spinner className="mr-2 h-3 w-3" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1.5" />
                        Join
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/group/${group.id}`);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendedGroups.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/groups")}
          >
            View All Recommendations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

