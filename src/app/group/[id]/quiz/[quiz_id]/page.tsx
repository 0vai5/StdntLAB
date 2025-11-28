"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { useTodoStore } from "@/store/useTodoStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  id: number;
  title: string;
  group_id: number;
  user_id: number;
  created_at: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isInitialized, isLoading: authLoading } = useAllStores();
  const { fetchTodos } = useTodoStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const groupId = params.id as string;
  const quizId = params.quiz_id as string;
  const numericGroupId = parseInt(groupId);
  const numericQuizId = parseInt(quizId);

  useEffect(() => {
    const fetchQuizData = async () => {
      // Wait for auth to initialize before checking user
      if (!isInitialized || authLoading) {
        return;
      }

      if (!groupId || !quizId || isNaN(numericGroupId) || isNaN(numericQuizId)) {
        toast.error("Invalid quiz ID");
        router.push(`/group/${groupId}`);
        return;
      }

      if (!user) {
        toast.error("You must be logged in");
        router.push(`/group/${groupId}`);
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

        // Fetch quiz
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", numericQuizId)
          .eq("group_id", numericGroupId)
          .single();

        if (quizError || !quizData) {
          toast.error("Quiz not found");
          router.push(`/group/${groupId}`);
          return;
        }

        setQuiz(quizData);

        // Check if user has already attempted this quiz
        const { data: submissionData } = await supabase
          .from("quiz_submission")
          .select("id")
          .eq("quiz_id", numericQuizId)
          .eq("user_id", numericUserId)
          .single();

        if (submissionData) {
          setHasAttempted(true);
          setIsLoading(false);
          return;
        }

        // Fetch quiz questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", numericQuizId)
          .order("id", { ascending: true });

        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          toast.error("Failed to load quiz questions");
          setIsLoading(false);
          return;
        }

        setQuestions(questionsData || []);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        toast.error("Failed to load quiz");
        router.push(`/group/${groupId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [groupId, quizId, numericGroupId, numericQuizId, user, router, isInitialized, authLoading]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || !user || questions.length === 0) return;

    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");

      // Calculate score
      let score = 0;
      questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          score++;
        }
      });

      const totalQuestions = questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      // Create quiz submission
      const { error: submissionError } = await supabase
        .from("quiz_submission")
        .insert({
          quiz_id: quiz.id,
          user_id: numericUserId,
          score: score,
          percentage: percentage,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString(),
        });

      if (submissionError) {
        console.error("Error submitting quiz:", submissionError);
        toast.error("Failed to submit quiz");
        setIsSubmitting(false);
        return;
      }

      // Find and mark the related todo as completed
      // The todo title format is "Complete Quiz: {material_title}"
      // The quiz title format is "Quiz: {material_title}"
      // Extract material title from quiz title
      const materialTitle = quiz.title.replace(/^Quiz: /, "");
      const todoTitle = `Complete Quiz: ${materialTitle}`;

      const { data: todosData } = await supabase
        .from("Todos")
        .select("id")
        .eq("user_id", numericUserId)
        .eq("group_id", quiz.group_id)
        .eq("title", todoTitle)
        .eq("status", "pending")
        .limit(1);

      if (todosData && todosData.length > 0) {
        const todoId = todosData[0].id;
        const completedAt = new Date().toISOString();

        // For group todos, only create todo_completions entry (don't update todo status)
        // This allows multiple users to complete the same group todo independently
        const { error: completionError } = await supabase
          .from("todo_completions")
          .insert({
            todo_id: todoId,
            user_id: numericUserId,
            completed_at: completedAt,
            completed: true,
          });

        if (completionError) {
          console.error("Error creating todo completion:", completionError);
          // Don't fail the request if todo completion fails
        }
        // Note: We don't update the todo status for group todos
        // as that would affect all users. Completion is tracked via todo_completions.
      }

      toast.success(`Quiz submitted! You scored ${score}/${totalQuestions} (${percentage}%)`);
      
      // Refetch todos to reflect the completion
      if (user) {
        const numericUserId =
          typeof user.id === "number" ? user.id : parseInt(user.id || "0");
        fetchTodos(numericUserId).catch((error) => {
          console.error("Error refetching todos:", error);
        });
      }
      
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (hasAttempted) {
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
            {quiz?.title}
          </h1>
        </div>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Quiz Already Attempted</h2>
            <p className="text-muted-foreground">
              You have already completed this quiz. Each quiz can only be taken once.
            </p>
            <Button onClick={() => router.push(`/group/${groupId}`)}>
              Back to Group
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/group/${groupId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Group
        </Button>
        <Card className="p-6">
          <p className="text-muted-foreground">Quiz not found</p>
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
          {quiz.title}
        </h1>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
              <h3 className="font-semibold text-lg">
                Question {index + 1}: {question.question}
              </h3>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`q${question.id}-o${optionIndex}`} />
                      <Label
                        htmlFor={`q${question.id}-o${optionIndex}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length !== questions.length}
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}

