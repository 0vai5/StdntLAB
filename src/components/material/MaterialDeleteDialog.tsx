"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import type { Material } from "@/store/useMaterialStore";

interface MaterialDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  onSuccess?: () => void;
}

export function MaterialDeleteDialog({
  open,
  onOpenChange,
  material,
  onSuccess,
}: MaterialDeleteDialogProps) {
  const { deleteMaterial, refreshGroupMaterials } = useAllStores();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!material) return;

    setIsDeleting(true);
    try {
      await deleteMaterial(material.id);
      toast.success("Material deleted successfully!");
      onOpenChange(false);
      await refreshGroupMaterials(material.group_id);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Material</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {material?.title}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

