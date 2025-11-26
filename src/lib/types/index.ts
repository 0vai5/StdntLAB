/**
 * Central export file for all types
 * Import types from here for better organization
 */

// User types
export type { UserProfile, EmptyFields } from "./user";

// Todo types
export type { Todo, CreateTodoInput, UpdateTodoInput } from "./todo";
export type { TodoStatus, TodoType, TodoPriority } from "./todo-enums";
export type { TodoFilters } from "./todo-filters";

// Activity types
export type { RecentActivity } from "./activity";

// Component prop types
export type { TodoFormProps, TodoCardProps, TodoListProps } from "./components";

