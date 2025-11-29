"use client";

import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { ProfileInformationTab } from "@/components/profile/ProfileInformationTab";
import { ProfileAchievementsTab } from "@/components/profile/ProfileAchievementsTab";
import { ProfileGroupsTab } from "@/components/profile/ProfileGroupsTab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllStores } from "@/store";
import { User } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const {
    user,
    isLoading,
    groups,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
    isInitialized,
    refreshGroups,
  } = useAllStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Show all fields when editing from profile page
  const emptyFields = {};

  // Initialize groups when component mounts
  useEffect(() => {
    if (!isInitialized || isLoading) {
      return;
    }
    if (user?.id && !groupsLoading && !groupsInitialized) {
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");
      if (!isNaN(numericUserId)) {
        initializeGroups(numericUserId);
      }
    }
  }, [
    user?.id,
    isLoading,
    isInitialized,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
  ]);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleGroupLeft = async () => {
    if (user?.id) {
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");
      if (!isNaN(numericUserId)) {
        await refreshGroups(numericUserId);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="rounded-lg border bg-card p-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <User className="h-8 w-8" />
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt={user?.name || user?.email} />
            <AvatarFallback className="text-2xl">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-1">
              {user?.name || "User"}
            </h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Update Preferences
          </Button>
        </div>

        <Tabs defaultValue="information" className="w-full">
          <TabsList>
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="mt-6">
            <ProfileInformationTab user={user} />
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <ProfileGroupsTab
              groups={groups}
              groupsLoading={groupsLoading}
              user={user}
              onGroupLeft={handleGroupLeft}
            />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <ProfileAchievementsTab />
          </TabsContent>

        </Tabs>
      </div>

      <PreferencesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        emptyFields={emptyFields}
      />
    </div>
  );
}
