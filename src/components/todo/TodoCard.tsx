"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TodoCardProps } from "@/lib/types/components";
import type { Todo } from "@/lib/types/todo";
import type { TodoPriority, TodoStatus } from "@/lib/types/todo-enums";
import { cn } from "@/lib/utils";
import {
  // CheckCircle2,
  // Circle,
  Clock,
  Edit2,
  MoreVertical,
  Trash2
} from "lucide-react";

// const STATUS_CONFIG: Record<
//   TodoStatus,
//   { label: string; icon: typeof CheckCircle2; color: string }
// > = {
//   pending: { label: "Pending", icon: Circle, color: "text-muted-foreground" },
//   in_progress: { label: "In Progress", icon: Clock, color: "text-blue-500" },
//   completed: {
//     label: "Completed",
//     icon: CheckCircle2,
//     color: "text-green-500",
//   },
// };

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

const TYPE_COLORS: Record<Todo["type"], string> = {
  personal:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  group: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export function TodoCard({
  todo,
  onToggleStatus,
  onEdit,
  onDelete,
  isLoading = false,
}: TodoCardProps) {
  // const statusConfig = STATUS_CONFIG[todo.status];

  const formatDate = (dateString: string) => {
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

  const isOverdue =
    todo.due_date &&
    new Date(todo.due_date) < new Date() &&
    todo.status !== "completed";
  const isDueToday =
    todo.due_date &&
    new Date(todo.due_date).toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0];

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        todo.status === "completed" && "opacity-75",
        isOverdue && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">
          <Checkbox
            checked={todo.status === "completed"}
            onCheckedChange={(checked) => {
              if (checked !== "indeterminate" && onToggleStatus) {
                const newStatus: TodoStatus = checked ? "completed" : "pending";
                onToggleStatus(todo.id, newStatus);
              }
            }}
            disabled={isLoading || !onToggleStatus}
            className={cn(isLoading && "opacity-50 cursor-not-allowed")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={cn(
                "font-semibold text-sm leading-tight",
                todo.status === "completed" &&
                  "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </h3>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(todo)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(todo.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {todo.description && (
            <p
              className={cn(
                "text-sm text-muted-foreground mb-3 line-clamp-2",
                todo.status === "completed" && "line-through"
              )}
            >
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={TYPE_COLORS[todo.type]}>
              {todo.type}
            </Badge>

            {todo.priority && (
              <Badge variant={PRIORITY_CONFIG[todo.priority].variant}>
                {PRIORITY_CONFIG[todo.priority].label}
              </Badge>
            )}

            {todo.due_date && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue && "text-destructive font-semibold",
                  isDueToday && !isOverdue && "text-orange-500 font-semibold",
                  !isOverdue && !isDueToday && "text-muted-foreground"
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{formatDate(todo.due_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
