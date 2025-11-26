import type { TodoStatus, TodoType, TodoPriority } from "./todo-enums";

/**
 * Todo filter options
 */
export interface TodoFilters {
  status?: TodoStatus[];
  type?: TodoType[];
  priority?: TodoPriority[];
  group_id?: number | null;
  date_from?: string | null;
  date_to?: string | null;
}

