"use client";

import { Card } from "@/components/ui/card";

export function DaysLeftToTargetCard() {
  // TODO: Replace with actual data from store/API
  const daysLeft = 0;

  return (
    <Card className="p-3 w-full">
      <h2 className="text-base font-semibold mb-2">Days Left to Next Target</h2>
      <p className="text-2xl font-bold">{daysLeft}</p>
    </Card>
  );
}

