"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, BookOpen, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { MaterialCreateDialog } from "@/components/material/MaterialCreateDialog";
import { QuizLeaderboard } from "@/components/quiz/QuizLeaderboard";
import { QuizDueCard } from "@/components/quiz/QuizDueCard";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [latestQuiz, setLatestQuiz] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [unattemptedQuiz, setUnattemptedQuiz] = useState<any>(null);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);

  const groupId = params.id as string;
  const numericGroupId = parseInt(groupId);

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

  const fetchQuizData = useCallback(async () => {
    if (!user || !numericGroupId || isNaN(numericGroupId)) return;

    setIsLoadingQuizzes(true);
    try {
      const supabase = createClient();
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");

      // Fetch latest quiz for the group
      const { data: quizzes, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("group_id", numericGroupId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (quizzesError) {
        console.error("Error fetching quizzes:", quizzesError);
        setIsLoadingQuizzes(false);
        return;
      }

      if (!quizzes || quizzes.length === 0) {
        setLatestQuiz(null);
        setLeaderboardData([]);
        setUnattemptedQuiz(null);
        setIsLoadingQuizzes(false);
        return;
      }

      const latest = quizzes[0];
      setLatestQuiz(latest);

      // Fetch submissions for the latest quiz
      const { data: submissions, error: submissionsError } = await supabase
        .from("quiz_submission")
        .select("*")
        .eq("quiz_id", latest.id)
        .order("percentage", { ascending: false })
        .order("score", { ascending: false });

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        setLeaderboardData([]);
      } else {
        // Fetch usernames for submissions
        const userIds = [
          ...new Set(submissions?.map((s) => s.user_id) || []),
        ];
        const { data: usersData } = await supabase
          .from("Users")
          .select("id, name, email")
          .in("id", userIds);

        const userMap = new Map(
          (usersData || []).map((u) => [u.id, u.name || u.email])
        );

        const leaderboard = (submissions || []).map((sub) => ({
          user_id: sub.user_id,
          username: userMap.get(sub.user_id) || `User ${sub.user_id}`,
          score: sub.score,
          percentage: sub.percentage,
          total_questions: sub.total_questions,
        }));

        setLeaderboardData(leaderboard);
      }

      // Check if user has attempted this quiz
      const { data: userSubmission } = await supabase
        .from("quiz_submission")
        .select("id")
        .eq("quiz_id", latest.id)
        .eq("user_id", numericUserId)
        .single();

      if (!userSubmission) {
        setUnattemptedQuiz(latest);
      } else {
        setUnattemptedQuiz(null);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [user, numericGroupId]);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupData();
  }, [groupId, fetchGroupData]);

  useEffect(() => {
    if (group && user) {
      fetchQuizData();
    }
  }, [group, user, fetchQuizData]);

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

      {/* Quiz and Material Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quiz Due Card - Always shown */}
        {!isLoadingQuizzes && (
          <QuizDueCard 
            quiz={unattemptedQuiz || null} 
            groupId={numericGroupId} 
          />
        )}

        {/* Material Upload Card */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Share Material with Group
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Have something to share with the members of the group? Feel free
                to upload the material and help your group members learn together.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quiz Leaderboard - Full Width */}
      {!isLoadingQuizzes && latestQuiz && leaderboardData.length > 0 && (
        <QuizLeaderboard
          submissions={leaderboardData}
          quizTitle={latestQuiz.title}
        />
      )}

      {/* Create Material Dialog */}
      {group && !isNaN(numericGroupId) && (
        <MaterialCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          groupId={numericGroupId}
        />
      )}
    </div>
  );
}
