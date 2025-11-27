"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Users, ArrowRight } from "lucide-react";
import { useAllStores } from "@/store";

export default function GroupsPage() {
  const router = useRouter();
  const {
    user,
    isLoading: isUserLoading,
    groups,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
  } = useAllStores();

  useEffect(() => {
    // Initialize groups only if user exists, not loading, and not already initialized
    if (user?.id && !isUserLoading && !groupsLoading && !groupsInitialized) {
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");
      if (!isNaN(numericUserId)) {
        initializeGroups(numericUserId);
      }
    }
  }, [
    user?.id,
    isUserLoading,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
  ]);

  if (isUserLoading || groupsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            My Groups
          </h1>
          <p className="mt-2 text-muted-foreground">
            All the study groups you&apos;re a member of
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            My Groups
          </h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">
            Please sign in to view your groups
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8" />
          My Groups
        </h1>
        <p className="mt-2 text-muted-foreground">
          All the study groups you&apos;re a member of
        </p>
      </div>

      {groups.length === 0 && groupsInitialized ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No Groups Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t joined any study groups yet. Create a new group
              or get matched with existing groups.
            </EmptyDescription>
          </EmptyHeader>
          <div className="flex gap-3 justify-center mt-4">
            <Button onClick={() => router.push("/dashboard")}>
              Get Matched
            </Button>
          </div>
        </Empty>
      ) : groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id}
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
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {group.name}
                  </h3>
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
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
