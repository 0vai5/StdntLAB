"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Users } from "lucide-react";
import { useAllStores } from "@/store";
import { GroupCard } from "@/components/groups/GroupCard";

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
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
