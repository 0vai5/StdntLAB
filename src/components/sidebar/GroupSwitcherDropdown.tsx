"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, ChevronDown, LayoutDashboard } from "lucide-react";
import { useAllStores } from "@/store";

interface GroupSwitcherDropdownProps {
  currentGroupId: number | null;
}

export function GroupSwitcherDropdown({
  currentGroupId,
}: GroupSwitcherDropdownProps) {
  const router = useRouter();
  const { groups, groupsLoading } = useAllStores();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2"
          disabled={groupsLoading}
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {groupsLoading
              ? "Loading..."
              : currentGroupId && groups.length > 0
              ? groups.find((g) => g.id === currentGroupId)?.name ||
                "Switch Group"
              : groups.length > 0
              ? "Switch Group"
              : "No Groups"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Groups</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        {groups.length > 0 && <DropdownMenuSeparator />}
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            onClick={() => router.push(`/group/${group.id}`)}
            className="cursor-pointer"
            disabled={currentGroupId !== null && group.id === currentGroupId}
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{group.name}</span>
            {currentGroupId !== null && group.id === currentGroupId && (
              <span className="text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
        ))}
        {groups.length === 0 && !groupsLoading && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              No groups available
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
