"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CTA() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/10">
      <div className="container mx-auto px-4">
        <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Ready to Get Started?</span>
            </div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold">
              Start Your Academic{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Journey
              </span>{" "}
              Today
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter,
              together. Get matched with your perfect study group in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button size="lg" className="group w-full sm:w-auto" asChild>
                <Link href="/auth/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              No credit card required • Free forever • Join in seconds
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

