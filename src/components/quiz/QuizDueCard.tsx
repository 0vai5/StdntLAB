"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Quiz {
  id: number;
  title: string;
}

interface QuizDueCardProps {
  quiz: Quiz | null;
  groupId: number;
}

export function QuizDueCard({ quiz, groupId }: QuizDueCardProps) {
  const router = useRouter();

  return (
    <Card className="p-6 border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileQuestion className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          {quiz ? (
            <>
              <h3 className="font-semibold text-lg mb-1">You have a quiz due!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quiz.title}
              </p>
              <Button
                onClick={() => router.push(`/group/${groupId}/quiz/${quiz.id}`)}
              >
                Take Quiz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg mb-1">No quizzes available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a quiz from material to get started with group quizzes.
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

