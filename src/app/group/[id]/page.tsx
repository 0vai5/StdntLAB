"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";

interface Group {
  id: number;
  name: string;
  description: string | null;
  tags: string[] | null;
  is_public: boolean;
  max_members: number;
  owner_id: number;
  created_at: string;
  member_count?: number;
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAllStores();
  const [group, setGroup] = useState<Group | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = params.id as string;

  const fetchGroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const numericGroupId = parseInt(groupId);

      // Fetch group details and member count in parallel
      const [groupResult, countResult] = await Promise.all([
        supabase
          .from("groups")
          .select("*")
          .eq("id", numericGroupId)
          .single(),
        supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", numericGroupId),
      ]);

      const { data: groupData, error: groupError } = groupResult;
      const { count, error: countError } = countResult;

      if (groupError || !groupData) {
        toast.error("Group not found");
        router.push("/dashboard");
        return;
      }

      setGroup(groupData);
      setMemberCount(count || 0);

      if (countError) {
        console.error("Error fetching member count:", countError);
        setMemberCount(0);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to load group");
    } finally {
      setIsLoading(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupData();
  }, [groupId, fetchGroupData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card className="p-6">
          <p className="text-muted-foreground">Group not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          {group.name}
        </h1>
      </div>

      {/* Group Info */}
      <Card className="p-6">
        <div className="space-y-4">
          {group.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
          )}

          {group.tags && group.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {memberCount} / {group.max_members} members
              </span>
            </div>
            <Badge variant={group.is_public ? "default" : "outline"}>
              {group.is_public ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
