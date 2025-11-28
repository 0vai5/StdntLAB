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

interface MaterialCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  onSuccess?: () => void;
}

interface MaterialFormData {
  title: string;
  content: string;
}

export function MaterialCreateDialog({
  open,
  onOpenChange,
  groupId,
  onSuccess,
}: MaterialCreateDialogProps) {
  const { user, createMaterial, refreshGroupMaterials } = useAllStores();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MaterialFormData>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    if (!user) {
      toast.error("You must be logged in to create material");
      return;
    }

    const numericUserId =
      typeof user.id === "number" ? user.id : parseInt(user.id || "0");

    if (!numericUserId || isNaN(numericUserId)) {
      toast.error("User ID not found. Please refresh and try again.");
      return;
    }

    if (!data.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!data.content.trim()) {
      toast.error("Content is required");
      return;
    }

    setIsLoading(true);
    try {
      await createMaterial(
        groupId,
        numericUserId,
        data.title.trim(),
        data.content.trim()
      );
      toast.success("Material created successfully!");
      reset();
      onOpenChange(false);
      await refreshGroupMaterials(groupId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Failed to create material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Material</DialogTitle>
          <DialogDescription>
            Share material with the members of this group
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter material title"
                {...register("title", { required: "Title is required" })}
                disabled={isLoading}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter material content"
                {...register("content", { required: "Content is required" })}
                disabled={isLoading}
                rows={6}
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
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
                  Creating...
                </>
              ) : (
                "Create Material"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

