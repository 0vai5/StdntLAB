"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Clock, PartyPopper, ArrowRight, CheckSquare } from "lucide-react";
import Link from "next/link";
import type { Todo } from "@/lib/types/todo";
import type { TodoPriority } from "@/lib/types/todo-enums";

interface DashboardTodosCardProps {
  todos: Todo[];
  allTodos: Todo[]; // All todos for progress calculation
  isLoading: boolean;
  onToggleTodo: (todoId: number, currentStatus: Todo["status"]) => void;
}

const PRIORITY_CONFIG: Record<
  TodoPriority,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "default" },
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = date.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Due today";
  if (dateStr === tomorrowStr) return "Due tomorrow";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function DashboardTodosCard({
  todos,
  allTodos,
  isLoading,
  onToggleTodo,
}: DashboardTodosCardProps) {
  // Calculate progress
  const progress = allTodos.length > 0
    ? Math.round(
        (allTodos.filter((t) => t.status === "completed").length /
          allTodos.length) *
          100
      )
    : 0;

  const completedCount = allTodos.filter((t) => t.status === "completed").length;
  const totalCount = allTodos.length;

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Todos</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/todo" className="text-xs">
            View All
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Progress Section */}
      {!isLoading && allTodos.length > 0 && (
        <div className="space-y-2 mb-4 pb-4 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">
              {completedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      {isLoading ? (
        <div className="space-y-2 flex flex-col">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PartyPopper className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {allTodos.length === 0
                ? "No todos yet"
                : "All caught up!"}
            </EmptyTitle>
            <EmptyDescription>
              {allTodos.length === 0
                ? "Create your first todo to get started"
                : "You've completed all your upcoming tasks! 🎉"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2 flex flex-col max-h-[400px] overflow-y-auto">
          {todos.slice(0, 5).map((todo) => {
            const isOverdue =
              todo.due_date &&
              new Date(todo.due_date) < new Date() &&
              todo.status !== "completed";
            const formattedDate = formatDate(todo.due_date);

            return (
              <div
                key={todo.id}
                className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                  todo.status === "completed"
                    ? "opacity-60 bg-muted/50"
                    : isOverdue
                    ? "border-destructive/50 bg-destructive/5"
                    : "bg-card"
                }`}
              >
                <div className="shrink-0">
                  <Checkbox
                    checked={todo.status === "completed"}
                    onCheckedChange={(checked) => {
                      if (checked !== "indeterminate") {
                        onToggleTodo(todo.id, todo.status);
                      }
                    }}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-medium text-sm leading-tight ${
                        todo.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </h3>
                  </div>
                  {todo.description && (
                    <p
                      className={`text-xs text-muted-foreground mt-0.5 line-clamp-1 ${
                        todo.status === "completed" ? "line-through" : ""
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge
                      variant={
                        todo.type === "personal" ? "outline" : "secondary"
                      }
                      className={`text-xs h-5 px-1.5 ${
                        todo.type === "personal"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {todo.type}
                    </Badge>
                    {todo.priority && (
                      <Badge 
                        variant={PRIORITY_CONFIG[todo.priority].variant}
                        className="text-xs h-5 px-1.5"
                      >
                        {PRIORITY_CONFIG[todo.priority].label}
                      </Badge>
                    )}
                    {formattedDate && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {todos.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              asChild
            >
              <Link href="/dashboard/todo">
                View {todos.length - 5} more todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

