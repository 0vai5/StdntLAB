"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Users, ArrowRight, Sparkles } from "lucide-react";
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

