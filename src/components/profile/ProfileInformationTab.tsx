"use client";

import { User, Mail, MapPin, GraduationCap, BookOpen, Clock, Calendar } from "lucide-react";
import type { UserProfile } from "@/lib/types/user";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const STUDY_PERIODS = [
  { value: "early_morning_bird", label: "Early Morning Bird (5am - 8am)" },
  { value: "morning", label: "Morning (8am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 5pm)" },
  { value: "evening", label: "Evening (5pm - 9pm)" },
  { value: "night_owl", label: "Night Owl (9pm - 12am)" },
  { value: "late_night", label: "Late Night (12am - 5am)" },
];

interface ProfileInformationTabProps {
  user: UserProfile | null;
}

const getDayLabel = (value: string) => {
  return DAYS_OF_WEEK.find((d) => d.value === value)?.label || value;
};

const getPeriodLabel = (value: string) => {
  return STUDY_PERIODS.find((p) => p.value === value)?.label || value;
};

export function ProfileInformationTab({ user }: ProfileInformationTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Name</p>
          <p className="text-sm text-muted-foreground">
            {user?.name || "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">
            {user?.email || "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Timezone</p>
          <p className="text-sm text-muted-foreground">
            {user?.timezone || "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Education Level</p>
          <p className="text-sm text-muted-foreground">
            {user?.education_level || "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Subjects</p>
          <p className="text-sm text-muted-foreground">
            {user?.subjects && user.subjects.length > 0
              ? user.subjects.join(", ")
              : "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Study Style</p>
          <p className="text-sm text-muted-foreground">
            {user?.study_style || "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Available Days</p>
          <p className="text-sm text-muted-foreground">
            {user?.days_of_week && user.days_of_week.length > 0
              ? user.days_of_week.map(getDayLabel).join(", ")
              : "Not set"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Study Periods</p>
          <p className="text-sm text-muted-foreground">
            {user?.study_times && user.study_times.length > 0
              ? user.study_times.map(getPeriodLabel).join(", ")
              : "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
}

