"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, LogOut } from "lucide-react";
import type { UserGroup } from "@/store/useGroupStore";
import { useAllStores } from "@/store";
import { LeaveGroupDialog } from "./LeaveGroupDialog";

interface GroupCardProps {
  group: UserGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter();
  const { user } = useAllStores();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/group/${group.id}`)}
    >
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={undefined} alt={group.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {group.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{group.name}</h3>
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
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {group.description}
        </p>
      )}

      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {group.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{group.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              {group.member_count} / {group.max_members}
            </span>
          </div>
          <Badge variant={group.is_public ? "default" : "outline"}>
            {group.is_public ? "Public" : "Private"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {group.user_role !== "owner" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsLeaveDialogOpen(true);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/group/${group.id}`);
            }}
          >
            View
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <LeaveGroupDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        group={group}
        user={user}
        onSuccess={() => {
          // Group will be removed from state by the store
          // No additional action needed here
        }}
      />
    </Card>
  );
}
