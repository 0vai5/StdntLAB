"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";

interface GroupMember {
  id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

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
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = params.id as string;

  const fetchGroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const numericGroupId = parseInt(groupId);

      // Fetch group details and members in parallel
      const [groupResult, membersResult] = await Promise.all([
        supabase
          .from("groups")
          .select("*")
          .eq("id", numericGroupId)
          .single(),
        supabase
          .from("group_members")
          .select("id, user_id, role, joined_at")
          .eq("group_id", numericGroupId)
          .order("joined_at", { ascending: true }),
      ]);

      const { data: groupData, error: groupError } = groupResult;
      const { data: membersData, error: membersError } = membersResult;

      if (groupError || !groupData) {
        toast.error("Group not found");
        router.push("/dashboard");
        return;
      }

      setGroup(groupData);

      if (membersError) {
        console.error("Error fetching members:", membersError);
        toast.error("Failed to load group members");
        setMembers([]);
        setIsLoading(false);
        return;
      }

      if (!membersData || membersData.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      // Get all unique user IDs
      const userIds = [
        ...new Set(
          membersData
            .map((member) => member.user_id)
            .filter((id): id is number => id !== null)
        ),
      ];

      // Fetch all user details in a single query using 'in' operator
      const { data: usersData, error: usersError } = await supabase
        .from("Users")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        toast.error("Failed to load member details");
        setMembers([]);
        setIsLoading(false);
        return;
      }

      // Create a map of user_id to user data
      const userMap = new Map(
        (usersData || []).map((user) => [user.id, user])
      );

      // Map members with user details
      const membersWithUsers = membersData.map((member) => {
        const userData = userMap.get(member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          user: userData || {
            id: member.user_id,
            name: null,
            email: "",
          },
        };
      });

      setMembers(membersWithUsers);
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
                {members.length} / {group.max_members} members
              </span>
            </div>
            <Badge variant={group.is_public ? "default" : "outline"}>
              {group.is_public ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Members List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Members</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members yet</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || member.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user.name || member.user.email}
                      {member.user.id === (user?.id ?? 0) && " (You)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    member.role === "owner"
                      ? "default"
                      : member.role === "admin"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
