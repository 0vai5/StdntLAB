"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  userId: number;
  onSuccess?: () => void;
}

interface FileWithProgress {
  file: File;
  progress?: number;
  error?: string;
  id: string; // Unique ID for each file
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const BUCKET_NAME = "StdntLAB";

export function FileUploadDialog({
  open,
  onOpenChange,
  groupId,
  userId,
  onSuccess,
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          } else if (error.code === "file-invalid-type") {
            toast.error(`${file.name} has an invalid file type.`);
          } else {
            toast.error(`${file.name}: ${error.message}`);
          }
        });
      });

      // Add accepted files
      const validFiles = acceptedFiles
        .filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            toast.error(`${file.name} is too large. Maximum size is 5MB.`);
            return false;
          }
          return true;
        })
        .map((file) => ({
          file,
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        }));

      setFiles((prev) => [...prev, ...validFiles]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    try {
      let successfulCount = 0;
      let failedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const fileWithProgress = files[i];
        const file = fileWithProgress.file;
        // Use original filename with timestamp prefix to avoid conflicts
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${groupId}/${userId}/${timestamp}-${sanitizedFileName}`;

        // Update progress
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithProgress.id ? { ...f, progress: 0 } : f
          )
        );

        // Upload to Supabase Storage
        const { data: filePath, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithProgress.id
                ? { ...f, error: uploadError.message, progress: undefined }
                : f
            )
          );
          toast.error(`Failed to upload ${file.name}`);
          failedCount++;
          continue;
        }

        // Update progress
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithProgress.id ? { ...f, progress: 100 } : f
          )
        );

        // Insert file record into database
        const { error: dbError } = await supabase.from("files").insert({
          user_id: userId,
          group_id: groupId,
          file_id: filePath?.id || crypto.randomUUID(), // Use filePath.id if available, otherwise generate UUID
          path: storagePath,
          file_name: file.name,
          mimetype: file.type || "application/octet-stream",
          size: file.size,
        });

        if (dbError) {
          console.error("Database error:", dbError);
          // Try to delete the uploaded file
          await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithProgress.id
                ? { ...f, error: dbError.message, progress: undefined }
                : f
            )
          );
          toast.error(`Failed to save ${file.name} to database`);
          failedCount++;
          continue;
        }

        successfulCount++;
      }

      // Show results and close dialog if there were any successful uploads
      if (successfulCount > 0) {
        toast.success(
          `Successfully uploaded ${successfulCount} file${
            successfulCount > 1 ? "s" : ""
          }`
        );
        // Clear file state
        setFiles([]);
        // Close dialog
        onOpenChange(false);
        // Refetch files
        onSuccess?.();
      } else if (failedCount > 0) {
        toast.error("All file uploads failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("An error occurred while uploading files");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to share with your group. Maximum file size is 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {isDragActive
                ? "Drop files here"
                : "Drag and drop files here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 5MB
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {files.map((fileWithProgress) => (
                <div
                  key={fileWithProgress.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <File className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileWithProgress.file.size)}
                    </p>
                    {fileWithProgress.progress !== undefined &&
                      fileWithProgress.progress < 100 && (
                        <Progress
                          value={fileWithProgress.progress}
                          className="mt-2 h-1"
                        />
                      )}
                    {fileWithProgress.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {fileWithProgress.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        removeFile(
                          files.findIndex((f) => f.id === fileWithProgress.id)
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([]);
                onOpenChange(false);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
