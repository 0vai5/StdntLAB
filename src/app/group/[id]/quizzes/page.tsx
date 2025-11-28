"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, FileQuestion, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

interface Quiz {
  id: number;
  title: string;
  created_at: string;
  user_id: number;
}

interface QuizSubmission {
  id: number;
  quiz_id: number;
  score: number;
  percentage: number;
  total_questions: number;
  completed_at: string;
}

export default function GroupQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAllStores();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Map<number, QuizSubmission>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const groupId = params.id as string;
  const numericGroupId = parseInt(groupId);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!groupId || isNaN(numericGroupId)) {
        toast.error("Invalid group ID");
        router.push("/dashboard");
        return;
      }

      if (!user) {
        toast.error("You must be logged in");
        router.push("/dashboard");
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const numericUserId =
          typeof user.id === "number" ? user.id : parseInt(user.id || "0");

        // Check if user is a member of the group
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", numericGroupId)
          .eq("user_id", numericUserId)
          .single();

        if (memberError || !memberData) {
          toast.error("You are not a member of this group");
          router.push(`/group/${groupId}`);
          return;
        }

        // Fetch all quizzes for the group
        const { data: quizzesData, error: quizzesError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("group_id", numericGroupId)
          .order("created_at", { ascending: false });

        if (quizzesError) {
          console.error("Error fetching quizzes:", quizzesError);
          toast.error("Failed to load quizzes");
          setIsLoading(false);
          return;
        }

        setQuizzes(quizzesData || []);

        // Fetch all submissions for the current user
        if (quizzesData && quizzesData.length > 0) {
          const quizIds = quizzesData.map((q) => q.id);
          const { data: submissionsData, error: submissionsError } =
            await supabase
              .from("quiz_submission")
              .select("*")
              .eq("user_id", numericUserId)
              .in("quiz_id", quizIds);

          if (submissionsError) {
            console.error("Error fetching submissions:", submissionsError);
          } else {
            const submissionsMap = new Map<number, QuizSubmission>();
            (submissionsData || []).forEach((sub) => {
              submissionsMap.set(sub.quiz_id, sub);
            });
            setSubmissions(submissionsMap);
          }
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Failed to load quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [groupId, numericGroupId, user, router]);

  // Filter quizzes based on search query
  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) {
      return quizzes;
    }

    const query = searchQuery.toLowerCase();
    return quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(query)
    );
  }, [quizzes, searchQuery]);

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
          Group Quizzes
        </h1>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quizzes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Quizzes List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestion className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery
                  ? "No quizzes found matching your search"
                  : "No quizzes available"}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Quizzes created from materials will appear here"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => {
              const submission = submissions.get(quiz.id);
              const isAttempted = !!submission;

              return (
                <Card
                  key={quiz.id}
                  className={`p-6 hover:shadow-lg transition-shadow ${
                    isAttempted
                      ? "border-green-500 border-2 bg-green-50/50 dark:bg-green-950/20"
                      : ""
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg flex-1">
                        {quiz.title}
                      </h3>
                      {isAttempted && (
                        <Badge
                          variant="default"
                          className="bg-green-500 text-white shrink-0"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Attempted
                        </Badge>
                      )}
                    </div>

                    {isAttempted && submission && (
                      <div className="p-3 rounded-lg bg-green-100/50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            Score:
                          </span>
                          <span className="text-sm font-bold text-green-900 dark:text-green-100">
                            {submission.score}/{submission.total_questions}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            Percentage:
                          </span>
                          <span className="text-sm font-bold text-green-900 dark:text-green-100">
                            {submission.percentage}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(quiz.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {!isAttempted && (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/group/${groupId}/quiz/${quiz.id}`)
                          }
                        >
                          Take Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

