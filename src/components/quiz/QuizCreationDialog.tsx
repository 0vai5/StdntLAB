"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FileQuestion, Sparkles } from "lucide-react";

interface QuizCreationDialogProps {
  open: boolean;
  materialTitle: string;
}

export function QuizCreationDialog({
  open,
  materialTitle,
}: QuizCreationDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-[500px] [&>button]:hidden" 
        onInteractOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-primary/10 rounded-full">
                <FileQuestion className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Creating Your Quiz
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            We're generating intelligent questions from{" "}
            <span className="font-semibold text-foreground">
              "{materialTitle}"
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Analyzing material content...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse delay-75" />
              <span>Generating questions with AI...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse delay-150" />
              <span>Preparing your quiz...</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            This may take a few moments. Please don't close this window.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

