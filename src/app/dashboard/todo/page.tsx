"use client";

import { useEffect, useState } from "react";
import { useAllStores } from "@/store";
import { TodoList } from "@/components/todo/TodoList";
import { CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { CreateTodoInput, UpdateTodoInput } from "@/lib/types/todo";
import { toast } from "sonner";

export default function TodoPage() {
  const {
    user,
    todos,
    todosLoading,
    initializeTodos,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  } = useAllStores();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!user?.id) return;

      setIsInitializing(true);
      try {
        // Initialize todos store with user ID (UUID string from Users table)
        await initializeTodos(user.id);
        // Fetch private todos (group_id is null)
        await fetchTodos(user.id, null);
      } catch (error) {
        console.error("Error initializing todos:", error);
        toast.error("Failed to load todos");
      } finally {
        setIsInitializing(false);
      }
    };

    if (user) {
      initialize();
    }
  }, [user?.id, initializeTodos, fetchTodos]);

  const handleCreateTodo = async (input: CreateTodoInput) => {
    if (!user?.id) {
      toast.error("User not found");
      return null;
    }
    return await createTodo(user.id, input);
  };

  const handleUpdateTodo = async (todoId: number, input: UpdateTodoInput) => {
    return await updateTodo(todoId, input);
  };

  const handleDeleteTodo = async (todoId: number) => {
    return await deleteTodo(todoId);
  };

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Todo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Keep track of your tasks and assignments
        </p>
      </div>

      {isInitializing || todosLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <TodoList
          todos={todos}
          isLoading={todosLoading}
          onCreateTodo={handleCreateTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          groupId={null}
        />
      )}
    </div>
  );
}
