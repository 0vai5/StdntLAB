"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PreferencesForm } from "./PreferencesForm";
import { useAllStores } from "@/store";
import { type EmptyFields } from "@/lib/utils/profile";
import type { ProfilePreferencesFormData } from "@/lib/validations/profile";

interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emptyFields: EmptyFields;
}

export function PreferencesModal({
  open,
  onOpenChange,
  emptyFields,
}: PreferencesModalProps) {
  const { user, updateUserProfile } = useAllStores();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: ProfilePreferencesFormData) => {
    setIsLoading(true);
    try {
      const updateData: {
        name?: string;
        timezone?: string;
        days_of_week?: string[];
        study_times?: string[];
        education_level?: string;
        subjects?: string[];
        study_style?: string;
      } = {};

      // If modal is opened from incomplete profile, only update empty fields
      // Otherwise, update all fields
      const shouldUpdateAll = Object.keys(emptyFields).length === 0;

      if (shouldUpdateAll || emptyFields.name) {
        if (data.name) updateData.name = data.name;
      }

      if (shouldUpdateAll || emptyFields.timezone) {
        if (data.timezone) updateData.timezone = data.timezone;
      }

      if (shouldUpdateAll || emptyFields.days_of_week) {
        if (data.days_of_week) updateData.days_of_week = data.days_of_week;
      }

      if (shouldUpdateAll || emptyFields.study_times) {
        if (data.study_times) updateData.study_times = data.study_times;
      }

      if (shouldUpdateAll || emptyFields.education_level) {
        if (data.education_level)
          updateData.education_level = data.education_level;
      }

      if (shouldUpdateAll || emptyFields.subjects) {
        if (data.subjects) updateData.subjects = data.subjects;
      }

      if (shouldUpdateAll || emptyFields.study_style) {
        if (data.study_style) updateData.study_style = data.study_style;
      }

      await updateUserProfile(updateData);
      toast.success("Profile updated successfully!");
      setHasChanges(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Preferences</DialogTitle>
          <DialogDescription>
            {Object.keys(emptyFields).length > 0
              ? "Please fill in the missing information to get matched with study partners."
              : "Update your profile information and preferences."}
          </DialogDescription>
        </DialogHeader>

        <PreferencesForm
          user={user}
          onSubmit={onSubmit}
          showAllFields={true}
          disabled={isLoading}
          onFormChange={setHasChanges}
          formRef={formRef}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setHasChanges(false);
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            disabled={!hasChanges || isLoading}
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {isLoading ? "Updating..." : "Update Preferences"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
