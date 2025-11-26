import type { TodoStatus, TodoType, TodoPriority } from "./todo-enums";

/**
 * Todo interface matching database schema
 */
export interface Todo {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  title: string;
  description: string | null;
  date: string | null; // due_date
  status: TodoStatus;
  type: TodoType;
  priority: TodoPriority | null;
  group_id: number | null;
}

/**
 * Create todo input (required fields)
 */
export interface CreateTodoInput {
  title: string;
  description?: string | null;
  date?: string | null; // due_date
  status: TodoStatus;
  type: TodoType;
  priority?: TodoPriority | null;
  group_id?: number | null;
}

/**
 * Update todo input (all fields optional except id)
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  date?: string | null; // due_date
  status?: TodoStatus;
  type?: TodoType;
  priority?: TodoPriority | null;
  group_id?: number | null;
}
