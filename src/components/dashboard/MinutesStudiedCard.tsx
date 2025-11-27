"use client";

import { Card } from "@/components/ui/card";

export function MinutesStudiedCard() {
  // TODO: Replace with actual data from store/API
  const minutesStudied = 0;

  return (
    <Card className="p-3 w-full">
      <h2 className="text-base font-semibold mb-2">Minutes Studied</h2>
      <p className="text-2xl font-bold">{minutesStudied}</p>
    </Card>
  );
}

