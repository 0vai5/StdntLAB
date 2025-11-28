"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { User, MoreVertical, Edit2, Trash2, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import type { Material } from "@/store/useMaterialStore";
import { MaterialEditDialog } from "./MaterialEditDialog";
import { MaterialDeleteDialog } from "./MaterialDeleteDialog";
import { QuizCreationDialog } from "@/components/quiz/QuizCreationDialog";
import { useAllStores } from "@/store";
import { useTodoStore } from "@/store/useTodoStore";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const router = useRouter();
  const { user } = useAllStores();
  const { fetchTodos } = useTodoStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const numericUserId =
    user && typeof user.id === "number"
      ? user.id
      : user
      ? parseInt(user.id || "0")
      : null;

  const isCreator = numericUserId !== null && material.user_id === numericUserId;

  const handleCreateQuiz = async () => {
    if (!user) {
      toast.error("You must be logged in to create a quiz");
      return;
    }

    const numericUserId =
      typeof user.id === "number" ? user.id : parseInt(user.id || "0");

    if (!numericUserId || isNaN(numericUserId)) {
      toast.error("User ID not found");
      return;
    }

    setIsCreatingQuiz(true);
    try {
      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId: material.id,
          groupId: material.group_id,
          userId: numericUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      // Show success message
      toast.success(
        `Quiz created successfully with ${data.questionsCount} questions!`
      );

      // Refetch todos to show the newly created todo
      if (user) {
        const numericUserId =
          typeof user.id === "number" ? user.id : parseInt(user.id || "0");
        fetchTodos(numericUserId).catch((error) => {
          console.error("Error refetching todos:", error);
        });
      }

      // Redirect to group page
      router.push(`/group/${material.group_id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create quiz"
      );
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow group relative">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-lg flex-1">{material.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs shrink-0">
                <User className="h-3 w-3 mr-1" />
                User ID: {material.user_id}
              </Badge>
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
                  <DropdownMenuItem
                    onClick={handleCreateQuiz}
                    disabled={isCreatingQuiz}
                  >
                    {isCreatingQuiz ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Creating Quiz...
                      </>
                    ) : (
                      <>
                        <FileQuestion className="mr-2 h-4 w-4" />
                        Create Quiz
                      </>
                    )}
                  </DropdownMenuItem>
                  {isCreator && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {material.content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {material.content}
            </p>
          )}

          <div className="flex items-center justify-end pt-4 border-t text-xs text-muted-foreground">
            <span>Created: {formatDate(material.created_at)}</span>
            {material.updated_at !== material.created_at && (
              <span className="ml-4">Updated: {formatDate(material.updated_at)}</span>
            )}
          </div>
        </div>
      </Card>

      <MaterialEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        material={material}
      />

      <MaterialDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        material={material}
      />

      <QuizCreationDialog
        open={isCreatingQuiz}
        materialTitle={material.title}
      />
    </>
  );
}

