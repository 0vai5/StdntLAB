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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initialize or reset start time
    if (startTime !== undefined) {
      // If startTime prop is provided, use it (and reset if it changed)
      if (startTimeRef.current !== startTime) {
        startTimeRef.current = startTime;
        setElapsedSeconds(0);
        completedRef.current = false;
      }
    } else if (startTimeRef.current === null) {
      // If no startTime prop and not initialized, use current time
      startTimeRef.current = Date.now();
    }
    // If startTime is undefined but we already have a startTimeRef, keep it

    // Calculate initial elapsed time immediately
    if (startTimeRef.current !== null) {
      const initialElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(initialElapsed);
      
      // Check if already completed
      if (initialElapsed >= duration && !completedRef.current) {
        completedRef.current = true;
        onComplete();
        return;
      }
    }

    // Set up interval to update every second
    if (startTimeRef.current !== null && !completedRef.current) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current === null) return;

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);

        // Call onComplete after the specified minimum duration
        if (elapsed >= duration && !completedRef.current) {
          completedRef.current = true;
          onComplete();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
