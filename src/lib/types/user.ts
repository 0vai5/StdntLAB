/**
 * User profile interface matching database schema
 */
export interface UserProfile {
  email: string;
  name?: string;
  id?: string;
  user_id?: string;
  timezone?: string | null;
  days_of_week?: string[] | null;
  study_times?: string[] | null;
  education_level?: string | null;
  subjects?: string[] | null;
  study_style?: string | null;
}

/**
 * Empty fields interface for profile completion
 */
export interface EmptyFields {
  name?: boolean;
  timezone?: boolean;
  days_of_week?: boolean;
  study_times?: boolean;
  education_level?: boolean;
  subjects?: boolean;
  study_style?: boolean;
}

