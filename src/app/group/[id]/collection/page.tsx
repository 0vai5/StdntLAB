"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ArrowLeft, Folder, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { FileUploadDialog } from "@/components/files/FileUploadDialog";
import { FileCard } from "@/components/files/FileCard";

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

export default function GroupCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAllStores();
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const groupId = params.id as string;
  const numericGroupId = parseInt(groupId);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!groupId || isNaN(numericGroupId)) {
        toast.error("Invalid group ID");
        router.push("/dashboard");
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: filesData, error } = await supabase
          .from("files")
          .select("*")
          .eq("group_id", numericGroupId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching files:", error);
          toast.error("Failed to load files");
          setFiles([]);
        } else {
          setFiles(filesData || []);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to load files");
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [groupId, numericGroupId, router]);

  const handleFileUploaded = () => {
    // Refetch files after upload
    const fetchFiles = async () => {
      try {
        const supabase = createClient();
        const { data: filesData, error } = await supabase
          .from("files")
          .select("*")
          .eq("group_id", numericGroupId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching files:", error);
        } else {
          setFiles(filesData || []);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  };

  const handleFileDeleted = (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const refetchFiles = async () => {
    try {
      const supabase = createClient();
      const { data: filesData, error } = await supabase
        .from("files")
        .select("*")
        .eq("group_id", numericGroupId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to refresh files");
      } else {
        setFiles(filesData || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to refresh files");
    }
  };

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }

    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.file_name.toLowerCase().includes(query));
  }, [files, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/group/${groupId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Collection
        </h1>
      </div>

      {/* Search Bar */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      )}

      {/* Files List */}
      <div className="space-y-4">
        {filteredFiles.length === 0 && files.length > 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No files found</EmptyTitle>
              <EmptyDescription>
                No files match your search query. Try a different term.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : files.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No files yet</EmptyTitle>
              <EmptyDescription>
                Upload files to share with your group members
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={handleFileDeleted}
                onRefetch={refetchFiles}
                canDelete={
                  !!(
                    user?.id &&
                    (typeof user.id === "number"
                      ? user.id
                      : parseInt(user.id || "0")) === file.user_id
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {files.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      {user && (
        <FileUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          groupId={numericGroupId}
          userId={
            typeof user.id === "number" ? user.id : parseInt(user.id || "0")
          }
          onSuccess={handleFileUploaded}
        />
      )}

      {/* Upload Button when no files */}
      {files.length === 0 && (
        <div className="flex justify-center">
          <Button onClick={() => setIsUploadDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );
}
