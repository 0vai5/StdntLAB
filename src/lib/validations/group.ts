import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name must be less than 100 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .nullable(), // ✔ fixed

  tags: z
    .array(z.string().min(1).max(30))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),

  is_public: z.boolean().optional().default(true),

  max_members: z
    .number()
    .int("Must be a whole number")
    .min(4, "Minimum 4 members required")
    .max(100, "Maximum 100 members allowed")
    .optional()
    .default(4),
});

export type CreateGroupFormData = z.input<typeof createGroupSchema>;
