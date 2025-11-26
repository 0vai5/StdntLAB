"use client";

import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          My Progress
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your learning progress and achievements
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Progress Overview</h3>
        <p className="text-muted-foreground">
          Your progress statistics and achievements will be displayed here.
          Monitor your learning journey and celebrate milestones.
        </p>
      </div>
    </div>
  );
}

