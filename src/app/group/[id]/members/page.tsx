"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { RemoveMemberDialog } from "@/components/groups/RemoveMemberDialog";
import { LeaveGroupDialog } from "@/components/groups/LeaveGroupDialog";

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

export default function GroupMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAllStores();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const groupId = params.id as string;

  const fetchGroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const numericGroupId = parseInt(groupId);

      // Fetch group details and members in parallel
      const [groupResult, membersResult] = await Promise.all([
        supabase.from("groups").select("*").eq("id", numericGroupId).single(),
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
      const userMap = new Map((usersData || []).map((user) => [user.id, user]));

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

  const handleRemoveClick = (member: GroupMember) => {
    setMemberToRemove(member);
    setIsDialogOpen(true);
  };

  const handleRemoveSuccess = (removedMemberId: number) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== removedMemberId)
    );
    setMemberToRemove(null);
  };

  const numericUserId =
    user && (typeof user.id === "number" ? user.id : parseInt(user.id || "0"));

  const isOwner =
    group && user && group.owner_id === numericUserId;

  // Find current user's role in the group
  const currentUserMember = members.find(
    (member) => member.user_id === numericUserId
  );
  const currentUserRole = currentUserMember?.role || null;

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
    <>
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
            Group Members
          </h1>
        </div>

        {/* Group Info Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{group.name}</h2>
                {group.description && (
                  <p className="text-muted-foreground">{group.description}</p>
                )}
              </div>
              {/* Leave Group Button - Only show if user is not the owner */}
              {!isOwner && currentUserRole && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={() => setIsLeaveDialogOpen(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Group
                </Button>
              )}
            </div>

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
          <h2 className="text-lg font-semibold mb-4">All Members</h2>
          {members.length === 0 ? (
            <p className="text-muted-foreground">No members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isCurrentUser =
                  member.user.id ===
                  (typeof user?.id === "number"
                    ? user.id
                    : parseInt(user?.id || "0"));
                const canRemove =
                  isOwner && !isCurrentUser && member.role !== "owner";

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {member.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || member.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-base">
                            {member.user.name || member.user.email}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined{" "}
                          {new Date(member.joined_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveClick(member)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <RemoveMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={memberToRemove}
        group={group}
        user={user}
        onSuccess={handleRemoveSuccess}
      />

      {/* Leave Group Dialog */}
      {currentUserRole && (
        <LeaveGroupDialog
          open={isLeaveDialogOpen}
          onOpenChange={setIsLeaveDialogOpen}
          group={{
            id: group.id,
            name: group.name,
            user_role: currentUserRole,
          }}
          user={user}
          onSuccess={() => {
            // Redirect to dashboard after leaving
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}
