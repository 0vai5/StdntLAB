"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";

interface MatchingCountdownProps {
  duration: number; // in seconds - minimum duration before calling onComplete
  onComplete: () => void;
  startTime?: number; // optional start time for real elapsed time
}

export function MatchingCountdown({
  duration,
  onComplete,
  startTime,
}: MatchingCountdownProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const needsResetRef = useRef(false);

  useEffect(() => {
    // Initialize start time
    if (startTime !== undefined) {
      startTimeRef.current = startTime;
      needsResetRef.current = true;
    } else if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, [startTime]);

  useEffect(() => {
    if (startTimeRef.current === null) return;

    const interval = setInterval(() => {
      // Reset if needed (when startTime prop changed)
      if (needsResetRef.current) {
        setElapsedSeconds(0);
        completedRef.current = false;
        needsResetRef.current = false;
        return;
      }

      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      setElapsedSeconds(elapsed);

      // Call onComplete after the specified minimum duration
      if (elapsed >= duration && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [duration, onComplete, startTime]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="p-8 w-full bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Finding Perfect Matches...
        </div>
        <div
          className="text-6xl font-bold text-primary tabular-nums"
          style={{
            fontFamily:
              '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
            letterSpacing: "0.1em",
            textShadow: "0 0 20px rgba(var(--primary), 0.3)",
          }}
        >
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-xs text-muted-foreground">
          Analyzing preferences and compatibility...
        </div>
      </div>
    </Card>
  );
}
