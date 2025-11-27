"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  createGroupSchema,
  type CreateGroupFormData,
} from "@/lib/validations/group";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAllStores } from "@/store";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateGroupFormData) => Promise<void>;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateGroupDialogProps) {
  const router = useRouter();
  const { user, authUser } = useAllStores();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "" as string | null,
      tags: [],
      is_public: true,
      max_members: 4,
    },
  });

  const tags = watch("tags") || [];
  const isPublic = watch("is_public");

  useEffect(() => {
    if (!open) {
      reset();
      setTagInput("");
    }
  }, [open, reset]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (tags.length >= 10) {
      toast.error("Maximum 10 tags allowed");
      return;
    }

    if (tags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }

    const newTags = [...tags, trimmedTag];
    setValue("tags", newTags);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setValue("tags", newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmitForm = async (data: CreateGroupFormData) => {
    if (!user || !authUser) {
      toast.error("You must be logged in to create a group");
      return;
    }

    // Use numeric user ID from store (already available)
    const numericUserId =
      typeof user.id === "number" ? user.id : parseInt(user.id || "0");

    if (!numericUserId || isNaN(numericUserId)) {
      toast.error("User ID not found. Please refresh and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Insert into 'groups' table
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: data.name,
          description: data.description?.trim() || null,
          tags: data.tags || [],
          is_public: data.is_public,
          max_members: data.max_members,
          owner_id: numericUserId,
          created_from_match: false,
        })
        .select()
        .single();

      if (groupError || !newGroup) {
        console.error("Error creating group:", groupError);
        toast.error("Failed to create group. Please try again.");
        return;
      }

      // Insert the creator as a member with 'owner' role
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: numericUserId,
          role: "owner",
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error("Error adding member:", memberError);
        toast.error("Group created but failed to add you as a member.");
        // Still redirect since group was created
      }

      if (onSubmit) {
        await onSubmit(data);
      }

      toast.success("Group created successfully!");
      reset();
      setTagInput("");
      onOpenChange(false);

      // Redirect to group page
      router.push(`/dashboard/group/${newGroup.id}`);
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Create a New Study Group
          </DialogTitle>
          <DialogDescription>
            Start a new study group and invite others to join you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Advanced Mathematics Study Group"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell others what this group is about..."
              rows={4}
              {...register("description")}
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add tags to help others find your group (max 10 tags)
            </p>
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <Label htmlFor="max_members">Maximum Members</Label>
            <Select
              value={watch("max_members")?.toString()}
              onValueChange={(value) =>
                setValue("max_members", parseInt(value))
              }
            >
              <SelectTrigger id="max_members" className="w-full">
                <SelectValue placeholder="Select max members" />
              </SelectTrigger>
              <SelectContent>
                {[4, 5, 10, 15, 20, 30, 50, 100].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.max_members && (
              <p className="text-sm text-destructive">
                {errors.max_members.message}
              </p>
            )}
          </div>

          {/* Public/Private */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={isPublic}
              onCheckedChange={(checked) =>
                setValue("is_public", checked === true)
              }
            />
            <Label
              htmlFor="is_public"
              className="text-sm font-normal cursor-pointer"
            >
              Make this group public
              <span className="text-muted-foreground block text-xs mt-0.5">
                Public groups can be discovered by anyone
              </span>
            </Label>
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
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
