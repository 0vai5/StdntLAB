"use client";

import { useState } from "react";
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
import { useGroupStore } from "@/store/useGroupStore";

interface UserGroup {
  id: number;
  name: string;
  user_role: string;
}

interface LeaveGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserGroup | null;
  user: UserProfile | null;
  onSuccess: () => void;
}

export function LeaveGroupDialog({
  open,
  onOpenChange,
  group,
  user,
  onSuccess,
}: LeaveGroupDialogProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const leaveGroup = useGroupStore((state) => state.leaveGroup);

  const handleLeaveConfirm = async () => {
    if (!group || !user) return;

    // Prevent owners from leaving their own groups
    if (group.user_role === "owner") {
      toast.error("Group owners cannot leave their own groups. Please transfer ownership first.");
      onOpenChange(false);
      return;
    }

    setIsLeaving(true);
    try {
      // Get numeric user ID
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");

      if (!numericUserId || isNaN(numericUserId)) {
        toast.error("User ID not found. Please refresh and try again.");
        setIsLeaving(false);
        return;
      }

      await leaveGroup(group.id, numericUserId);
      
      toast.success("Successfully left the group");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave{" "}
            <span className="font-semibold text-foreground">
              {group?.name}
            </span>
            ? You will need to be re-invited to rejoin this group.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLeaving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeaveConfirm}
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving..." : "Leave Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

