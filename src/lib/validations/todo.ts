import { z } from "zod";
import type {
  TodoStatus,
  TodoType,
  TodoPriority,
} from "@/lib/types/todo-enums";

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .nullable(),
  date: z.string().optional().nullable(), // due_date (database column is 'date')
  status: z.enum(["pending", "in_progress", "completed"]),
  type: z.enum(["personal", "group"]),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  group_id: z.number().optional().nullable(),
});

export const updateTodoSchema = createTodoSchema.partial().extend({
  status: z
    .enum(["pending", "in_progress", "completed"])
    .optional(),
  type: z.enum(["personal", "group"]).optional(),
});

export type CreateTodoFormData = z.infer<typeof createTodoSchema>;
export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>;
