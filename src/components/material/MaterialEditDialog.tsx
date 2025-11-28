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
import type { Material } from "@/store/useMaterialStore";

interface MaterialEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  onSuccess?: () => void;
}

interface MaterialFormData {
  title: string;
  content: string;
}

export function MaterialEditDialog({
  open,
  onOpenChange,
  material,
  onSuccess,
}: MaterialEditDialogProps) {
  const { updateMaterial, refreshGroupMaterials } = useAllStores();
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
    if (material && open) {
      reset({
        title: material.title,
        content: material.content,
      });
    } else if (!open) {
      reset();
    }
  }, [material, open, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    if (!material) return;

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
      await updateMaterial(
        material.id,
        data.title.trim(),
        data.content.trim()
      );
      toast.success("Material updated successfully!");
      onOpenChange(false);
      await refreshGroupMaterials(material.group_id);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Failed to update material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update the material details
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
                  Updating...
                </>
              ) : (
                "Update Material"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

