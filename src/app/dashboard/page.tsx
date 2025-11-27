/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DashboardTodosCard } from "@/components/dashboard/DashboardTodosCard";
import { MinutesStudiedCard } from "@/components/dashboard/MinutesStudiedCard";
import { DaysLeftToTargetCard } from "@/components/dashboard/DaysLeftToTargetCard";
import { GroupMatchingCTA } from "@/components/dashboard/GroupMatchingCTA";
import {
  getEmptyFields,
  getProfileCompletionPercentage,
  isProfileComplete,
} from "@/lib/utils/profile";
import { useAllStores } from "@/store";
import { UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TodoStatus, TodoPriority } from "@/lib/types/todo-enums";
import { toast } from "sonner";

export default function DashboardPage() {
  const {
    user,
    isLoading,
    todos,
    todosLoading,
    todosInitialized,
    initializeTodos,
    updateTodo,
    groups,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
    hasGroups,
  } = useAllStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emptyFields = getEmptyFields(user);
  const profileComplete = isProfileComplete(user);

  useEffect(() => {
    // Only fetch todos if user exists, not loading, and not already initialized
    if (user?.id && !todosLoading && !todosInitialized) {
      initializeTodos(Number(user.id));
    }
  }, [user?.id, todosInitialized, initializeTodos, todosLoading]);

  // Initialize groups if user exists and groups are not initialized
  useEffect(() => {
    if (user?.id && !groupsLoading && !groupsInitialized) {
      initializeGroups(Number(user.id));
    }
  }, [user?.id, groupsInitialized, initializeGroups, groupsLoading]);

  // Calculate progress - must be called before any conditional returns
  const progress = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [todos]);

  // Get and sort incomplete todos by due_date and priority - must be called before any conditional returns
  const incompleteTodos = useMemo(() => {
    const priorityOrder: Record<TodoPriority | "none", number> = {
      high: 3,
      medium: 2,
      low: 1,
      none: 0,
    };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Filter: only show incomplete todos that are due today or have no due date
    return todos
      .filter((todo) => {
        // Exclude completed todos
        if (todo.status === "completed") return false;

        // Include todos without a due date
        if (!todo.due_date) return true;

        // Include todos due today
        const todoDateStr = new Date(todo.due_date).toISOString().split("T")[0];
        return todoDateStr === todayStr;
      })
      .sort((a, b) => {
        // First sort by due_date (todos with due date first, then nulls)
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;

        if (aDate !== bDate) {
          return aDate - bDate;
        }

        // Then sort by priority (high > medium > low > none)
        const aPriority = priorityOrder[a.priority || "none"];
        const bPriority = priorityOrder[b.priority || "none"];

        return bPriority - aPriority; // Higher priority first
      });
  }, [todos]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  // Don't show incomplete profile message if user is null (logged out)
  if (!user) {
    return null;
  }

  if (!profileComplete) {
    const completionPercentage = getProfileCompletionPercentage(user);

    return (
      <>
        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Please complete your profile to get matched with study partners.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="rounded-full bg-primary/10 p-4">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <h2 className="text-2xl font-semibold">Profile Completion</h2>
                <p className="text-muted-foreground">
                  Complete your profile to unlock all features and get matched
                  with study partners.
                </p>
              </div>

              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {completionPercentage}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="mt-4"
              >
                Update Preferences
              </Button>
            </div>
          </div>
        </div>

        <PreferencesModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          emptyFields={emptyFields}
        />
      </>
    );
  }

  const handleToggleTodo = async (
    todoId: number,
    currentStatus: TodoStatus
  ) => {
    const newStatus: TodoStatus =
      currentStatus === "completed" ? "pending" : "completed";
    try {
      const result = await updateTodo(todoId, { status: newStatus });
      if (result) {
        toast.success(
          newStatus === "completed"
            ? "Todo completed!"
            : "Todo marked as pending"
        );
      } else {
        toast.error("Failed to update todo");
      }
    } catch (error) {
      toast.error("An error occurred while updating todo");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome 👋 {user?.name || "User"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here is All your gameplan for today followed by you progress.
        </p>
      </div>

      {/* Group Matching CTA - Only show if user is not in any groups */}
      {!groupsLoading && !hasGroups() && <GroupMatchingCTA />}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-semibold text-primary">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardTodosCard
          todos={incompleteTodos}
          isLoading={todosLoading}
          onToggleTodo={handleToggleTodo}
        />
        <MinutesStudiedCard />
        <DaysLeftToTargetCard />
      </div>
    </div>
  );
}
