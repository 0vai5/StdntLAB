"use client";

import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Calendar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your schedule and upcoming events
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
        <p className="text-muted-foreground">
          Your calendar will appear here. Schedule your study sessions and track
          important dates.
        </p>
      </div>
    </div>
  );
}

