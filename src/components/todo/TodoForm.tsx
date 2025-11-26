"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTodoSchema,
  updateTodoSchema,
  type CreateTodoFormData,
  type UpdateTodoFormData,
} from "@/lib/validations/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TodoFormProps } from "@/lib/types/components";
import { TodoPriority } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const TYPE_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "group", label: "Group" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function TodoForm({
  open,
  onOpenChange,
  todo,
  onSubmit,
  isLoading = false,
  isPersonalTodo = false,
}: TodoFormProps) {
  const isEditing = !!todo;
  const schema = isEditing ? updateTodoSchema : createTodoSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTodoFormData | UpdateTodoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: null,
      date: null,
      status: "pending",
      type: "personal",
      priority: null,
      group_id: null,
    },
  });

  useEffect(() => {
    if (todo) {
      reset({
        title: todo.title,
        description: todo.description || null,
        date: todo.date || null,
        status: todo.status,
        type: todo.type,
        priority: todo.priority || null,
        group_id: todo.group_id || null,
      });
    } else {
      reset({
        title: "",
        description: null,
        date: null,
        status: "pending",
        type: "personal",
        priority: null,
        group_id: null,
      });
    }
  }, [todo, reset, open]);

  const onSubmitForm = async (
    data: CreateTodoFormData | UpdateTodoFormData
  ) => {
    // Automatically set type to "personal" for personal todos
    const formData = isPersonalTodo
      ? { ...data, type: "personal" as const }
      : data;
    await onSubmit(formData);
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  const statusValue = watch("status");
  const typeValue = watch("type");
  const priorityValue = watch("priority");
  const dateValue = watch("date");

  const selectedDate = dateValue ? new Date(dateValue) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Todo" : "Create New Todo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your todo details"
              : "Add a new task to your todo list"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter todo title"
              {...register("title")}
              disabled={isLoading}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description (optional)"
              {...register("description")}
              disabled={isLoading}
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div
            className={cn(
              "grid gap-4",
              isPersonalTodo ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setValue("status", value as CreateTodoFormData["status"])
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  id="status"
                  className={errors.status ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {!isPersonalTodo && (
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={typeValue}
                  onValueChange={(value) =>
                    setValue("type", value as CreateTodoFormData["type"])
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="type"
                    className={errors.type ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setValue(
                        "date",
                        date ? format(date, "yyyy-MM-dd") : null
                      );
                    }}
                    disabled={isLoading}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priorityValue ? priorityValue : "none"}
                onValueChange={(value) => {
                  // Handle clearing: if value is "none", set to null, otherwise set the value
                  setValue(
                    "priority",
                    value === "none" ? null : (value as TodoPriority)
                  );
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="priority"
                  className={errors.priority ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select priority (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner size="sm" className="mr-2" />}
              {isEditing ? "Update" : "Create"} Todo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
