"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import type { SessionRequest } from "@/store/useSessionStore";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  userId: number;
  request?: SessionRequest | null; // If provided, pre-fill from request
  onSuccess?: () => void;
}

interface CreateSessionFormData {
  topic: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  groupId,
  userId,
  request,
  onSuccess,
}: CreateSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createSession, acceptSessionRequest } = useAllStores();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateSessionFormData>({
    defaultValues: {
      topic: "",
      date: "",
      start_time: "",
      end_time: "",
      meeting_link: "",
    },
  });

  const dateValue = watch("date");

  // Pre-fill form if request is provided
  useEffect(() => {
    if (request && open) {
      try {
        const startDate = new Date(request.start_time);
        const endDate = new Date(request.end_time);
        
        // Extract time in HH:MM format
        const startTime = startDate.toTimeString().slice(0, 5);
        const endTime = endDate.toTimeString().slice(0, 5);
        
        setValue("topic", request.topic);
        setValue("date", request.date);
        setValue("start_time", startTime);
        setValue("end_time", endTime);
        
        // Set selected date for calendar
        if (request.date) {
          const date = new Date(request.date);
          if (!isNaN(date.getTime())) {
            setSelectedDate(date);
          }
        }
      } catch (error) {
        console.error("Error pre-filling form from request:", error);
      }
    } else if (!open) {
      reset();
      setSelectedDate(undefined);
    }
  }, [request, open, setValue, reset]);

  // Sync selectedDate with form date value
  useEffect(() => {
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else if (!request) {
      setSelectedDate(undefined);
    }
  }, [dateValue, request]);

  const onSubmit = async (data: CreateSessionFormData) => {
    if (!userId || isNaN(userId)) {
      toast.error("User ID is invalid. Please refresh the page.");
      return;
    }

    if (!data.topic.trim()) {
      toast.error("Topic is required");
      return;
    }

    if (!data.date) {
      toast.error("Date is required");
      return;
    }

    if (!data.start_time) {
      toast.error("Start time is required");
      return;
    }

    if (!data.end_time) {
      toast.error("End time is required");
      return;
    }

    // Validate that end time is after start time
    const startDateTime = new Date(`${data.date}T${data.start_time}`);
    const endDateTime = new Date(`${data.date}T${data.end_time}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      // Convert time to ISO format with timezone
      const startDateTime = new Date(`${data.date}T${data.start_time}`);
      const endDateTime = new Date(`${data.date}T${data.end_time}`);

      if (request) {
        // If accepting a request, use acceptSessionRequest with updated values
        await acceptSessionRequest(
          request.id,
          userId,
          data.meeting_link.trim() || undefined,
          {
            topic: data.topic.trim(),
            date: data.date,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
          }
        );
        toast.success("Session request accepted and session created!");
      } else {
        // Otherwise, create a new session
        await createSession(groupId, userId, {
          topic: data.topic.trim(),
          date: data.date,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          meeting_link: data.meeting_link.trim() || undefined,
          request_id: null,
        });
        toast.success("Session created successfully!");
      }

      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(
        request
          ? "Failed to accept session request. Please try again."
          : "Failed to create session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {request ? "Accept Request & Create Session" : "Organize Session"}
          </DialogTitle>
          <DialogDescription>
            {request
              ? "Review and edit the request details, then create the session"
              : "Create a new study session for this group"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Textarea
                id="topic"
                placeholder="Enter session topic"
                {...register("topic", { required: "Topic is required" })}
                disabled={isLoading}
                className={errors.topic ? "border-destructive" : ""}
                rows={3}
              />
              {errors.topic && (
                <p className="text-sm text-destructive">
                  {errors.topic.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
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
                    type="button"
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
                      setSelectedDate(date);
                      setValue(
                        "date",
                        date ? format(date, "yyyy-MM-dd") : "",
                        { shouldValidate: true }
                      );
                    }}
                    disabled={isLoading}
                    initialFocus
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
              <input
                type="hidden"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  {...register("start_time", {
                    required: "Start time is required",
                  })}
                  disabled={isLoading}
                  className={errors.start_time ? "border-destructive" : ""}
                />
                {errors.start_time && (
                  <p className="text-sm text-destructive">
                    {errors.start_time.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  {...register("end_time", {
                    required: "End time is required",
                  })}
                  disabled={isLoading}
                  className={errors.end_time ? "border-destructive" : ""}
                />
                {errors.end_time && (
                  <p className="text-sm text-destructive">
                    {errors.end_time.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_link">Meeting Link (Optional)</Label>
              <Input
                id="meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                {...register("meeting_link")}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {request ? "Creating..." : "Creating..."}
                </>
              ) : request ? (
                "Accept & Create Session"
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

