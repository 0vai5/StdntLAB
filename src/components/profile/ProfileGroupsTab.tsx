"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Users, LogOut } from "lucide-react";
import { LeaveGroupDialog } from "@/components/groups/LeaveGroupDialog";
import type { UserGroup } from "@/store/useGroupStore";
import type { UserProfile } from "@/lib/types/user";

interface ProfileGroupsTabProps {
  groups: UserGroup[];
  groupsLoading: boolean;
  user: UserProfile | null;
  onGroupLeft?: () => void;
}

export function ProfileGroupsTab({
  groups,
  groupsLoading,
  user,
  onGroupLeft,
}: ProfileGroupsTabProps) {
  const [selectedGroupForLeave, setSelectedGroupForLeave] = useState<number | null>(null);

  if (groupsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Users className="h-6 w-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No Groups Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t joined any study groups yet. Create a new group or
            get matched with existing groups.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-semibold">Group Name</th>
                <th className="text-left p-4 font-semibold">Description</th>
                <th className="text-left p-4 font-semibold">Members</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">Type</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium">{group.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                      {group.description || "No description"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {group.member_count} / {group.max_members}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        group.user_role === "owner"
                          ? "default"
                          : group.user_role === "admin"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {group.user_role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={group.is_public ? "default" : "outline"}
                      className="text-xs"
                    >
                      {group.is_public ? "Public" : "Private"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {group.user_role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroupForLeave(group.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Leave group"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGroupForLeave && (
        <LeaveGroupDialog
          open={selectedGroupForLeave !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedGroupForLeave(null);
            }
          }}
          group={groups.find((g) => g.id === selectedGroupForLeave) || null}
          user={user}
          onSuccess={() => {
            setSelectedGroupForLeave(null);
            onGroupLeft?.();
          }}
        />
      )}
    </>
  );
}

