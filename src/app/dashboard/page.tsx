"use client";

import { useState } from "react";
import { useAllStores } from "@/store";
import { getEmptyFields, isProfileComplete, getProfileCompletionPercentage } from "@/lib/utils/profile";
import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { UserPlus } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAllStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emptyFields = getEmptyFields(user);
  const profileComplete = isProfileComplete(user);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    const completionPercentage = getProfileCompletionPercentage(user);

  return (
      <>
    <div className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground">
              Complete Your Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
              Please complete your profile to get matched with study partners.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="rounded-full bg-primary/10 p-4">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <h2 className="text-2xl font-semibold">Profile Completion</h2>
                <p className="text-muted-foreground">
                  Complete your profile to unlock all features and get matched with study partners.
          </p>
        </div>

              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {completionPercentage}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>

        <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="mt-4"
        >
                Update Preferences
        </Button>
            </div>
          </div>
        </div>

        <PreferencesModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          emptyFields={emptyFields}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome 👋 {user?.name || "User"}
        </h1>
        <p className="mt-2 text-muted-foreground">Here's your overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <p className="text-sm text-muted-foreground">
            Your dashboard statistics will appear here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Your recent activities will be displayed here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Upcoming Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Your upcoming tasks and deadlines will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
