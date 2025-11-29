"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Trophy } from "lucide-react";

export function ProfileAchievementsTab() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Trophy className="h-6 w-6" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Coming Soon</EmptyTitle>
        <EmptyDescription>
          Your achievements will be displayed here once you start completing
          study sessions and reaching milestones.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

