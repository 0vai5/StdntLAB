"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Users, UserCheck } from "lucide-react";
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

interface MatchedGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: MatchedGroup[];
}

export function MatchedGroupsDialog({
  open,
  onOpenChange,
  groups,
}: MatchedGroupsDialogProps) {
  const router = useRouter();
  const { user, authUser, refreshGroups } = useAllStores();
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const handleJoinGroup = async (groupId: string) => {
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
      const numericGroupId = parseInt(groupId);

      // Check if group exists and has space
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("max_members")
        .eq("id", numericGroupId)
        .single();

      if (groupError || !groupData) {
        toast.error("Group not found");
        return;
      }

      // Check current member count
      const { count: currentMembers } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", numericGroupId);

      if (currentMembers && currentMembers >= groupData.max_members) {
        toast.error("This group is full");
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", numericGroupId)
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
          group_id: numericGroupId,
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
      
      onOpenChange(false);
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group. Please try again.");
    } finally {
      setJoiningGroupId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🎉 Great Matchings for You!
          </DialogTitle>
          <DialogDescription>
            We found {groups.length} group{groups.length !== 1 ? "s" : ""} that
            match your preferences perfectly.
          </DialogDescription>
        </DialogHeader>

        {groups.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No matching groups found at the moment. Try creating your own
              group!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={group.avatar} alt={group.title} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {group.title
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {group.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{group.memberTotal} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        {group.membersOnline} online
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joiningGroupId === group.id}
                >
                  {joiningGroupId === group.id ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Joining...
                    </>
                  ) : (
                    "Join Group"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
