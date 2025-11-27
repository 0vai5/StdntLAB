"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchingCountdown } from "./MatchingCountdown";
import { MatchedGroupsDialog } from "./MatchedGroupsDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { createClient } from "@/lib/supabase/client";
import { useAllStores } from "@/store";
import { toast } from "sonner";

interface MatchedGroup {
  id: string;
  title: string;
  avatar?: string;
  memberTotal: number;
  membersOnline: number;
}

export function GroupMatchingCTA() {
  const { user, authUser } = useAllStores();
  const [isMatching, setIsMatching] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [matchedGroups, setMatchedGroups] = useState<MatchedGroup[]>([]);
  const [matchingStartTime, setMatchingStartTime] = useState<number>(0);

  // TODO: Replace with real Supabase query
  // This would query the 'study_groups' table with:
  // 1. Filter by user preferences (subject, level, availability, etc.)
  // 2. Join with 'group_members' to get member counts
  // 3. Use realtime subscriptions to get online member counts from 'user_sessions' or 'presence' table
  // 4. Order by compatibility score (calculated based on preferences match)
  // Example query:
  // const { data: matchedGroups } = await supabase
  //   .from('study_groups')
  //   .select(`
  //     id,
  //     title,
  //     avatar_url,
  //     group_members(count),
  //     online_members:user_sessions!inner(count)
  //   `)
  //   .eq('subject', userPreferences.subject)
  //   .eq('level', userPreferences.level)
  //   .limit(3)

  const handleGetMatched = async () => {
    if (!user || !authUser) {
      toast.error("You must be logged in to get matched");
      return;
    }

    setIsMatching(true);
    setMatchingStartTime(Date.now());

    // Use numeric user ID from store (already available)
    const numericUserId =
      typeof user.id === "number" ? user.id : parseInt(user.id || "0");

    if (!numericUserId || isNaN(numericUserId)) {
      toast.error("User ID not found. Please refresh and try again.");
      setIsMatching(false);
      return;
    }

    try {
      const supabase = createClient();

      // Fetch all public groups
      const { data: allGroups, error: groupsError } = await supabase
        .from("groups")
        .select("id, name, tags, is_public, max_members")
        .eq("is_public", true);

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
        toast.error("Failed to fetch groups");
        setIsMatching(false);
        return;
      }

      // Get member counts for each group
      const groupsWithMembers = await Promise.all(
        (allGroups || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          // Check if user is already a member
          const { data: existingMember } = await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", group.id)
            .eq("user_id", numericUserId)
            .single();

          return {
            ...group,
            memberCount: count || 0,
            isMember: !!existingMember,
          };
        })
      );

      // Filter groups: exclude full groups and groups user is already in
      const availableGroups = groupsWithMembers.filter(
        (group) => group.memberCount < group.max_members && !group.isMember
      );

      // Match by preferences (timezone and subjects)
      const userTimezone = user.timezone;
      const userSubjects = user.subjects || [];

      // Get group owners' preferences to match
      const matchedGroupsList: MatchedGroup[] = [];

      for (const group of availableGroups.slice(0, 10)) {
        // Get group owner's preferences
        const { data: groupData } = await supabase
          .from("groups")
          .select("owner_id")
          .eq("id", group.id)
          .single();

        if (groupData) {
          const { data: ownerData } = await supabase
            .from("Users")
            .select("timezone, subjects")
            .eq("id", groupData.owner_id)
            .single();

          let matchScore = 0;

          // Match by timezone
          if (ownerData?.timezone && userTimezone) {
            if (ownerData.timezone === userTimezone) {
              matchScore += 2;
            }
          }

          // Match by subjects (check if any subjects overlap)
          if (ownerData?.subjects && userSubjects.length > 0) {
            const ownerSubjects = Array.isArray(ownerData.subjects)
              ? ownerData.subjects
              : [];
            const commonSubjects = ownerSubjects.filter((s: string) =>
              userSubjects.includes(s)
            );
            if (commonSubjects.length > 0) {
              matchScore += commonSubjects.length;
            }
          }

          // Also match by tags if they overlap with user subjects
          if (
            group.tags &&
            Array.isArray(group.tags) &&
            userSubjects.length > 0
          ) {
            const commonTags = group.tags.filter((tag: string) =>
              userSubjects.some(
                (subject: string) =>
                  subject.toLowerCase().includes(tag.toLowerCase()) ||
                  tag.toLowerCase().includes(subject.toLowerCase())
              )
            );
            if (commonTags.length > 0) {
              matchScore += commonTags.length;
            }
          }

          // Only include groups with at least some match
          if (matchScore > 0) {
            matchedGroupsList.push({
              id: group.id.toString(),
              title: group.name,
              avatar: undefined,
              memberTotal: group.memberCount,
              membersOnline: Math.floor(group.memberCount * 0.3), // Estimate online members
            });
          }
        }
      }

      // Sort by match score and take top 3
      const sortedGroups = matchedGroupsList
        .sort((a, b) => b.memberTotal - a.memberTotal)
        .slice(0, 3);

      setMatchedGroups(sortedGroups);
    } catch (error) {
      console.error("Error matching groups:", error);
      toast.error("Failed to match groups");
    }
  };

  const handleCountdownComplete = () => {
    setIsMatching(false);
    setShowDialog(true);
  };

  return (
    <>
      <Card className="p-6 w-full bg-primary/5 border-primary/20">
        {isMatching ? (
          <MatchingCountdown
            duration={2}
            onComplete={handleCountdownComplete}
            startTime={matchingStartTime}
          />
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-semibold mb-1">
                Ready to study with others?
              </h2>
              <p className="text-sm text-muted-foreground">
                Create your own study group or get matched with existing groups
                based on your preferences.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={handleGetMatched}>
                Get Matched
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowCreateDialog(true)}
              >
                Create a Group
              </Button>
            </div>
          </div>
        )}
      </Card>

      <MatchedGroupsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        groups={matchedGroups}
      />

      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
