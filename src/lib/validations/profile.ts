import { z } from "zod";

export const profilePreferencesSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  timezone: z.string().min(1, "Timezone is required").optional(),
  days_of_week: z.array(z.string()).min(1, "At least one day is required").optional(),
  study_times: z.array(z.string()).min(1, "At least one study period is required").optional(),
  education_level: z.string().min(1, "Education level is required").optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required").optional(),
  study_style: z.string().min(1, "Study style is required").optional(),
});

export type ProfilePreferencesFormData = z.infer<
  typeof profilePreferencesSchema
>;

