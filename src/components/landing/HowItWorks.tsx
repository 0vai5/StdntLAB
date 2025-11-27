"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Set up your profile with your subjects, education level, study preferences, and availability.",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    number: "02",
    icon: Search,
    title: "Get Matched",
    description:
      "Our AI algorithm matches you with compatible study groups based on your preferences and goals.",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    number: "03",
    icon: Users,
    title: "Join or Create Groups",
    description:
      "Join existing groups or create your own. Collaborate with peers who share your academic journey.",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Start Studying",
    description:
      "Organize tasks, track progress, share materials, and achieve your academic goals together.",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and connect with your perfect study group.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="relative">
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono font-bold"
                    >
                      {step.number}
                    </Badge>
                    {!isLast && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground lg:hidden" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>

                {/* Connection arrow for desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-24 -right-3 z-10">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

