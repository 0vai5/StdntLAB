"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/types/user";

interface GroupMember {
  id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface Group {
  id: number;
  name: string;
  owner_id: number;
}

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: GroupMember | null;
  group: Group | null;
  user: UserProfile | null;
  onSuccess: (removedMemberId: number) => void;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  group,
  user,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveConfirm = async () => {
    if (!member || !group || !user) return;

    setIsRemoving(true);
    try {
      const supabase = createClient();
      // Match the pattern used in members page for consistency
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");

      if (!numericUserId || isNaN(numericUserId)) {
        toast.error("User ID not found. Please refresh and try again.");
        setIsRemoving(false);
        return;
      }

      // Verify user is the owner
      if (group.owner_id !== numericUserId) {
        toast.error("Only the group owner can remove members");
        onOpenChange(false);
        setIsRemoving(false);
        return;
      }

      // Prevent removing the owner
      if (member.role === "owner") {
        toast.error("Cannot remove the group owner");
        onOpenChange(false);
        setIsRemoving(false);
        return;
      }

      const memberUserId = member.user_id;

      // Get all quiz IDs for this group
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("id")
        .eq("group_id", group.id);

      const quizIds = quizzesData?.map((q) => q.id) || [];

      // Delete all quiz submissions for this member and group's quizzes
      if (quizIds.length > 0) {
        const { error: submissionsError } = await supabase
          .from("quiz_submission")
          .delete()
          .eq("user_id", memberUserId)
          .in("quiz_id", quizIds);

        if (submissionsError) {
          console.error("Error deleting quiz submissions:", submissionsError);
          // Continue even if this fails
        }
      }

      // Delete all materials created by this member for this group
      const { error: materialsError } = await supabase
        .from("material")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", memberUserId);

      if (materialsError) {
        console.error("Error deleting materials:", materialsError);
        // Continue even if this fails
      }

      // Remove member from group
      const { error: removeError } = await supabase
        .from("group_members")
        .delete()
        .eq("id", member.id)
        .eq("group_id", group.id);

      if (removeError) {
        console.error("Error removing member:", removeError);
        toast.error("Failed to remove member. Please try again.");
        setIsRemoving(false);
        return;
      }

      toast.success("Member removed successfully");
      onOpenChange(false);
      onSuccess(member.id);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {member?.user.name || member?.user.email}
            </span>{" "}
            from this group? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
