"use client";

import { CheckSquare } from "lucide-react";

export default function TodoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Todo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Keep track of your tasks and assignments
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Todo List</h3>
        <p className="text-muted-foreground">
          Your tasks will appear here. Create, organize, and complete your todo
          items.
        </p>
      </div>
    </div>
  );
}

