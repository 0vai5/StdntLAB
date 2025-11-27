"use client";

import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllStores } from "@/store";
import { BookOpen, Calendar, Clock, GraduationCap, Mail, MapPin, Trophy, User, Users } from "lucide-react";
import { useState } from "react";

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

export default function ProfilePage() {
  const { user, isLoading } = useAllStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Show all fields when editing from profile page
  const emptyFields = {};

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const getDayLabel = (value: string) => {
    return DAYS_OF_WEEK.find((d) => d.value === value)?.label || value;
  };

  const getPeriodLabel = (value: string) => {
    return STUDY_PERIODS.find((p) => p.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="rounded-lg border bg-card p-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <User className="h-8 w-8" />
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt={user?.name || user?.email} />
            <AvatarFallback className="text-2xl">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-1">
              {user?.name || "User"}
            </h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Update Preferences
          </Button>
        </div>

        <Tabs defaultValue="information" className="w-full">
          <TabsList>
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="mt-6">
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
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Empty>
              <EmptyMedia variant="icon">
                <Trophy className="h-6 w-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Coming Soon</EmptyTitle>
                <EmptyDescription>
                  Your achievements will be displayed here once you start
                  completing study sessions and reaching milestones.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <Empty>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Coming Soon</EmptyTitle>
                <EmptyDescription>
                  Your study groups will be displayed here once you join or
                  create study groups with other students.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>
        </Tabs>
      </div>

      <PreferencesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        emptyFields={emptyFields}
      />
    </div>
  );
}
