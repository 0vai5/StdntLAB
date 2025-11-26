import type { Todo } from "./todo";
import type { CreateTodoInput, UpdateTodoInput } from "./todo";
import type { TodoStatus } from "./todo-enums";

/**
 * TodoForm component props
 */
export interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => Promise<void>;
  isLoading?: boolean;
  isPersonalTodo?: boolean; // If true, type field is hidden and auto-set to "personal"
}

/**
 * TodoCard component props
 */
export interface TodoCardProps {
  todo: Todo;
  onToggleStatus?: (todoId: number, status: TodoStatus) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todoId: number) => void;
  isLoading?: boolean;
}

/**
 * TodoList component props
 */
export interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  onCreateTodo: (input: CreateTodoInput) => Promise<Todo | null>;
  onUpdateTodo: (todoId: number, input: UpdateTodoInput) => Promise<Todo | null>;
  onDeleteTodo: (todoId: number) => Promise<boolean>;
  groupId?: number | null;
}

