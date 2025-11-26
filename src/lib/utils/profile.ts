import type { UserProfile } from "@/store/useAuthStore";

export interface EmptyFields {
  name?: boolean;
  timezone?: boolean;
  days_of_week?: boolean;
  study_times?: boolean;
  education_level?: boolean;
  subjects?: boolean;
  study_style?: boolean;
}

/**
 * Check which fields are empty in the user profile
 */
export function getEmptyFields(user: UserProfile | null): EmptyFields {
  if (!user) {
    return {
      name: true,
      timezone: true,
      days_of_week: true,
      study_times: true,
      education_level: true,
      subjects: true,
      study_style: true,
    };
  }

  const emptyFields: EmptyFields = {};

  if (!user.name || user.name.trim() === "") {
    emptyFields.name = true;
  }

  if (!user.timezone || user.timezone.trim() === "") {
    emptyFields.timezone = true;
  }

  if (!user.days_of_week || user.days_of_week.length === 0) {
    emptyFields.days_of_week = true;
  }

  if (!user.study_times || user.study_times.length === 0) {
    emptyFields.study_times = true;
  }

  if (!user.education_level || user.education_level.trim() === "") {
    emptyFields.education_level = true;
  }

  if (!user.subjects || user.subjects.length === 0) {
    emptyFields.subjects = true;
  }

  if (!user.study_style || user.study_style.trim() === "") {
    emptyFields.study_style = true;
  }

  return emptyFields;
}

/**
 * Check if user profile is complete
 */
export function isProfileComplete(user: UserProfile | null): boolean {
  const emptyFields = getEmptyFields(user);
  return Object.keys(emptyFields).length === 0;
}

/**
 * Get list of empty field names
 */
export function getEmptyFieldNames(user: UserProfile | null): string[] {
  const emptyFields = getEmptyFields(user);
  return Object.keys(emptyFields).filter((key) => emptyFields[key as keyof EmptyFields]);
}

/**
 * Calculate profile completion percentage
 */
export function getProfileCompletionPercentage(user: UserProfile | null): number {
  if (!user) return 0;
  
  const totalFields = 7; // name, timezone, days_of_week, study_times, education_level, subjects, study_style
  const emptyFields = getEmptyFields(user);
  const completedFields = totalFields - Object.keys(emptyFields).length;
  
  return Math.round((completedFields / totalFields) * 100);
}
