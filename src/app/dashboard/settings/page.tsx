"use client";

import { useState, useRef } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { useAllStores } from "@/store";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { ProfilePreferencesFormData } from "@/lib/validations/profile";

export default function SettingsPage() {
  const { user, updateUserProfile, isLoading } = useAllStores();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (data: ProfilePreferencesFormData) => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: data.name,
        timezone: data.timezone,
        days_of_week: data.days_of_week,
        study_times: data.study_times,
        education_level: data.education_level,
        subjects: data.subjects,
        study_style: data.study_style,
      });
      toast.success("Settings updated successfully!");
      setHasChanges(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update settings. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Preferences</CardTitle>
          <CardDescription>
            Update your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm
            user={user}
            onSubmit={handleSubmit}
            showAllFields={true}
            disabled={isSaving}
            onFormChange={setHasChanges}
            formRef={formRef}
          />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
              disabled={!hasChanges || isSaving}
            >
              {isSaving && <Spinner size="sm" className="mr-2" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
