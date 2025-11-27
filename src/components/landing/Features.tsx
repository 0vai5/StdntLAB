"use client";

import {
  Users,
  Sparkles,
  CheckSquare,
  TrendingUp,
  Clock,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Get matched with study groups based on your preferences, timezone, subjects, and learning style.",
    gradient: "from-purple-500/10 to-purple-600/10",
    iconColor: "text-purple-600",
  },
  {
    icon: Users,
    title: "Smart Group Collaboration",
    description:
      "Form or join study groups with students who share your academic goals and schedule.",
    gradient: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-600",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Organize personal and group tasks with priorities, due dates, and progress tracking.",
    gradient: "from-green-500/10 to-green-600/10",
    iconColor: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor your study hours, track completion rates, and visualize your academic progress.",
    gradient: "from-orange-500/10 to-orange-600/10",
    iconColor: "text-orange-600",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Set your availability, preferred study times, and find groups that match your schedule.",
    gradient: "from-pink-500/10 to-pink-600/10",
    iconColor: "text-pink-600",
  },
  {
    icon: FileText,
    title: "Shared Materials",
    description:
      "Collaborate on study materials, share resources, and work together on group projects.",
    gradient: "from-indigo-500/10 to-indigo-600/10",
    iconColor: "text-indigo-600",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description:
      "Your data is secure. Control your privacy settings and study in a safe environment.",
    gradient: "from-red-500/10 to-red-600/10",
    iconColor: "text-red-600",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Stay connected with instant notifications and real-time collaboration features.",
    gradient: "from-yellow-500/10 to-yellow-600/10",
    iconColor: "text-yellow-600",
  },
];

export function Features() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make studying collaborative, efficient,
            and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

