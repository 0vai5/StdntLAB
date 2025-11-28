"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: number;
  username: string;
  score: number;
  percentage: number;
  total_questions: number;
}

interface QuizLeaderboardProps {
  submissions: LeaderboardEntry[];
  quizTitle: string;
}

export function QuizLeaderboard({
  submissions,
  quizTitle,
}: QuizLeaderboardProps) {
  if (submissions.length === 0) {
    return null;
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "default";
    if (index === 1) return "secondary";
    if (index === 2) return "outline";
    return "outline";
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Latest Quiz Leaderboard</h3>
          <p className="text-sm text-muted-foreground">{quizTitle}</p>
        </div>

        <div className="space-y-2">
          {submissions.map((entry, index) => (
            <div
              key={entry.user_id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 shrink-0">
                  {getRankIcon(index) || (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.username || `User ${entry.user_id}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getRankBadge(index)} className="text-xs">
                  {entry.score}/{entry.total_questions}
                </Badge>
                <span className="text-sm font-semibold min-w-[3rem] text-right">
                  {entry.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

