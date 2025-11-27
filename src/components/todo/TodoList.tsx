"use client";

import { useState, useMemo } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoCard } from "./TodoCard";
import { TodoForm } from "./TodoForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CheckSquare } from "lucide-react";
import type { TodoListProps } from "@/lib/types/components";
import type {
  TodoStatus,
  TodoType,
  // TodoPriority,
} from "@/lib/types/todo-enums";
import { toast } from "sonner";
import { CreateTodoInput, Todo, UpdateTodoInput } from "@/lib/types";

const STATUS_FILTERS: { value: TodoStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const TYPE_FILTERS: { value: TodoType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "personal", label: "Personal" },
  { value: "group", label: "Group" },
];

export function TodoList({
  todos,
  isLoading = false,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  groupId,
}: TodoListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TodoStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TodoType | "all">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTodos = useMemo(() => {
    let filtered = [...todos];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((todo) => todo.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((todo) => todo.type === typeFilter);
    }

    // Sort by: overdue first, then by due date, then by created date
    filtered.sort((a, b) => {
      const now = new Date();
      const aDate = a.due_date ? new Date(a.due_date) : null;
      const bDate = b.due_date ? new Date(b.due_date) : null;

      // Overdue items first
      if (aDate && aDate < now && a.status !== "completed") {
        if (!bDate || bDate >= now || b.status === "completed") return -1;
      }
      if (bDate && bDate < now && b.status !== "completed") {
        if (!aDate || aDate >= now || a.status === "completed") return 1;
      }

      // Then by due date
      if (aDate && bDate) {
        return aDate.getTime() - bDate.getTime();
      }
      if (aDate) return -1;
      if (bDate) return 1;

      // Finally by created date (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return filtered;
  }, [todos, searchQuery, statusFilter, typeFilter]);

  const handleCreateTodo = async (data: CreateTodoInput | UpdateTodoInput) => {
    setIsSubmitting(true);
    try {
      const result = await onCreateTodo(data as CreateTodoInput);
      if (result) {
        toast.success("Todo created successfully!");
        setIsFormOpen(false);
      } else {
        toast.error("Failed to create todo");
      }
    } catch (error) {
      toast.error("An error occurred while creating todo");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTodo = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (!editingTodo) return;

    setIsSubmitting(true);
    try {
      const result = await onUpdateTodo(
        editingTodo.id,
        data as UpdateTodoInput
      );
      if (result) {
        toast.success("Todo updated successfully!");
        setEditingTodo(null);
        setIsFormOpen(false);
      } else {
        toast.error("Failed to update todo");
      }
    } catch (error) {
      toast.error("An error occurred while updating todo");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (todoId: number, status: TodoStatus) => {
    try {
      const result = await onUpdateTodo(todoId, { status });
      if (result) {
        if (status === "completed") {
          toast.success("Todo completed!");
        } else {
          toast.success("Todo status updated");
        }
      }
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error(error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      const success = await onDeleteTodo(todoId);
      if (success) {
        toast.success("Todo deleted successfully");
      } else {
        toast.error("Failed to delete todo");
      }
    } catch (error) {
      toast.error("An error occurred while deleting todo");
      console.error(error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const pending = todos.filter((t) => t.status === "pending").length;
    const inProgress = todos.filter((t) => t.status === "in_progress").length;
    return { total, completed, pending, inProgress };
  }, [todos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {groupId === null || groupId === undefined
              ? "My Todos"
              : "Group Todos"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} total • {stats.completed} completed • {stats.pending}{" "}
            pending
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Todo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TodoStatus)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as TodoType)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Todo List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckSquare className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {todos.length === 0
                ? "No todos yet"
                : "No todos match your filters"}
            </EmptyTitle>
            <EmptyDescription>
              {todos.length === 0
                ? "Create your first todo to get started"
                : "Try adjusting your search or filter criteria"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditClick}
              onDelete={handleDeleteTodo}
              isLoading={isSubmitting}
            />
          ))}
        </div>
      )}

      {/* Todo Form */}
      <TodoForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        todo={editingTodo}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        isLoading={isSubmitting}
        isPersonalTodo={groupId === null || groupId === undefined}
      />
    </div>
  );
}
