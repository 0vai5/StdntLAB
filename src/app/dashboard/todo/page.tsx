"use client";

import { TodoList } from "@/components/todo/TodoList";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateTodoInput, UpdateTodoInput } from "@/lib/types/todo";
import { useAllStores } from "@/store";
import { CheckSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function TodoPage() {
  const {
    user,
    todos,
    todosLoading,
    todosInitialized,
    initializeTodos,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  } = useAllStores();
  
  // Only show initializing if todos aren't already initialized
  const [isInitializing, setIsInitializing] = useState(!todosInitialized);

  // Filter to show only personal todos (group_id is null)
  const personalTodos = useMemo(() => {
    return todos.filter((todo) => todo.group_id === null);
  }, [todos]);

  useEffect(() => {
    const initialize = async () => {
      if (!user?.id) {
        setIsInitializing(false);
        return;
      }

      // If todos are already initialized, fetch personal todos in background
      if (todosInitialized) {
        setIsInitializing(false);
        // Fetch personal todos to ensure we have the latest data (don't block UI)
        fetchTodos(Number(user.id), null).catch((error) => {
          console.error("Error fetching todos:", error);
        });
        return;
      }

      // Only show loading if we actually need to initialize
      setIsInitializing(true);

      try {
        // Initialize todos store with user ID
        await initializeTodos(Number(user.id));
        // Fetch private todos (group_id is null)
        await fetchTodos(Number(user.id), null);
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
  }, [user?.id, todosInitialized, initializeTodos, fetchTodos, user]);

  const handleCreateTodo = async (input: CreateTodoInput) => {
    if (!user?.id) {
      toast.error("User not found");
      return null;
    }
    return await createTodo(Number(user.id), input);
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

      {isInitializing || (!todosInitialized && todosLoading) ? (
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
          todos={personalTodos}
          isLoading={!todosInitialized && todosLoading}
          onCreateTodo={handleCreateTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          groupId={null}
        />
      )}
    </div>
  );
}
