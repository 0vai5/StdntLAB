"use client";

import { useState, useEffect, useMemo } from "react";
import { useAllStores } from "@/store";
import {
  getEmptyFields,
  isProfileComplete,
  getProfileCompletionPercentage,
} from "@/lib/utils/profile";
import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus,
  CheckSquare,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { formatActivityMessage } from "@/lib/utils/activity";
import Link from "next/link";
import type { Todo } from "@/lib/types/todo";

export default function DashboardPage() {
  const {
    user,
    isLoading,
    todos,
    recentActivities,
    todosLoading,
    initializeTodos,
    fetchTodos,
    getRecentActivities,
  } = useAllStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emptyFields = getEmptyFields(user);
  const profileComplete = isProfileComplete(user);

  useEffect(() => {
    if (user?.id && !todosLoading) {
      initializeTodos(user.id);
      fetchTodos(user.id, null);
    }
  }, [user?.id, initializeTodos, fetchTodos, todosLoading]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
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

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const pending = todos.filter((t) => t.status === "pending").length;
    const inProgress = todos.filter((t) => t.status === "in_progress").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, inProgress, completionRate };
  }, [todos]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return todos
      .filter((todo) => {
        if (todo.status === "completed")
          return false;
        if (!todo.date) return false;
        const dueDate = new Date(todo.date);
        return dueDate >= now;
      })
      .sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : Infinity;
        const bDate = b.date ? new Date(b.date).getTime() : Infinity;
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [todos]);

  const recentActivityList = useMemo(() => {
    return getRecentActivities(5);
  }, [recentActivities, getRecentActivities]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome 👋 {user?.name || "User"}
        </h1>
        <p className="mt-2 text-muted-foreground">Here's your overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Todos
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                In Progress
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </p>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
            <Progress value={stats.completionRate} className="h-2 w-16" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </h3>
            <Link href="/dashboard/todo">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {recentActivityList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivityList.map((activity) => (
                <div key={activity.id} className="text-sm">
                  <p className="text-foreground">
                    {formatActivityMessage(activity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </h3>
            <Link href="/dashboard/todo">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((todo) => (
                <div key={todo.id} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{todo.title}</p>
                    {todo.date && (
                      <p className="text-xs text-muted-foreground">
                        Due{" "}
                        {new Date(todo.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
