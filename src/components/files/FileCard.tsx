"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  File,
  Download,
  Trash2,
  MoreVertical,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface GroupFile {
  id: number;
  created_at: string;
  user_id: number;
  group_id: number;
  file_id: string;
  path: string;
  file_name: string;
  mimetype: string;
  size: number;
}

interface FileCardProps {
  file: GroupFile;
  onDelete: (fileId: number) => void;
  onRefetch?: () => void;
  canDelete: boolean;
}

const BUCKET_NAME = "StdntLAB";

export function FileCard({
  file,
  onDelete,
  onRefetch,
  canDelete,
}: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleView = async () => {
    try {
      const supabase = createClient();
      // Get public URL for viewing
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(file.path, 3600); // 1 hour expiry

      if (error) {
        console.error("View error:", error);
        toast.error("Failed to open file");
        return;
      }

      // Open in new tab
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Failed to open file");
    }
  };

  const handleDownload = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(file.path);

      if (error) {
        console.error("Download error:", error);
        toast.error("Failed to download file");
        return;
      }

      if (!data) {
        toast.error("File data not available");
        return;
      }

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success("File downloaded");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([file.file_id]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue to delete from database even if storage delete fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id);

      if (dbError) {
        console.error("Database delete error:", dbError);
        toast.error("Failed to delete file");
        setIsDeleting(false);
        return;
      }

      toast.success("File deleted");
      onDelete(file.id);
      setShowDeleteDialog(false);
      // Refetch files after deletion
      onRefetch?.();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate mb-1">
              {file.file_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(file.created_at)}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px] duration-0! data-[state=open]:animate-none! data-[state=closed]:animate-none!">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
