"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profilePreferencesSchema,
  type ProfilePreferencesFormData,
} from "@/lib/validations/profile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { TIMEZONES } from "@/lib/data/timezones";
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

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
  "Professional",
];

const COMMON_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Business",
  "Law",
  "Psychology",
  "History",
  "Literature",
  "Languages",
  "Art",
  "Music",
];

const STUDY_STYLES = [
  "Solo",
  "Group Study",
  "Discussion Based",
  "Problem Solving",
  "Review Sessions",
  "Mixed",
];

interface PreferencesFormProps {
  user: UserProfile | null;
  onSubmit: (data: ProfilePreferencesFormData) => Promise<void>;
  showAllFields?: boolean;
  disabled?: boolean;
  onFormChange?: (hasChanges: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function PreferencesForm({
  user,
  onSubmit,
  showAllFields = false,
  disabled = false,
  onFormChange,
  formRef,
}: PreferencesFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ProfilePreferencesFormData>({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: {
      name: user?.name || "",
      timezone: user?.timezone || "",
      days_of_week: user?.days_of_week || [],
      study_times: user?.study_times || [],
      education_level: user?.education_level || "",
      subjects: user?.subjects || [],
      study_style: user?.study_style || "",
    },
  });

  const selectedDays = watch("days_of_week") || [];
  const selectedStudyPeriods = watch("study_times") || [];
  const selectedSubjects = watch("subjects") || [];
  const formValues = watch();

  // Check for changes
  useEffect(() => {
    if (!onFormChange) return;

    const hasChanges = JSON.stringify({
      name: user?.name || "",
      timezone: user?.timezone || "",
      days_of_week: user?.days_of_week || [],
      study_times: user?.study_times || [],
      education_level: user?.education_level || "",
      subjects: user?.subjects || [],
      study_style: user?.study_style || "",
    }) !== JSON.stringify({
      name: formValues.name || "",
      timezone: formValues.timezone || "",
      days_of_week: formValues.days_of_week || [],
      study_times: formValues.study_times || [],
      education_level: formValues.education_level || "",
      subjects: formValues.subjects || [],
      study_style: formValues.study_style || "",
    });

    onFormChange(hasChanges);
  }, [formValues, user, onFormChange]);

  // Reset form when user changes
  useEffect(() => {
    reset({
      name: user?.name || "",
      timezone: user?.timezone || "",
      days_of_week: user?.days_of_week || [],
      study_times: user?.study_times || [],
      education_level: user?.education_level || "",
      subjects: user?.subjects || [],
      study_style: user?.study_style || "",
    });
  }, [user, reset]);

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setValue("days_of_week", newDays);
  };

  const toggleStudyPeriod = (period: string) => {
    const newPeriods = selectedStudyPeriods.includes(period)
      ? selectedStudyPeriods.filter((p) => p !== period)
      : [...selectedStudyPeriods, period];
    setValue("study_times", newPeriods);
  };

  const toggleSubject = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    setValue("subjects", newSubjects);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter your name"
          disabled={disabled}
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Combobox
          options={TIMEZONES}
          value={watch("timezone")}
          onValueChange={(value) => setValue("timezone", value)}
          placeholder="Select your timezone"
          searchPlaceholder="Search timezone..."
          disabled={disabled}
        />
        {errors.timezone && (
          <p className="text-sm text-destructive">
            {errors.timezone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="education_level">Education Level</Label>
        <Select
          value={watch("education_level")}
          onValueChange={(value) => setValue("education_level", value)}
          disabled={disabled}
        >
          <SelectTrigger id="education_level" className="w-full">
            <SelectValue placeholder="Select your education level" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.education_level && (
          <p className="text-sm text-destructive">
            {errors.education_level.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Subjects</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select the subjects you study (select all that apply)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {COMMON_SUBJECTS.map((subject) => {
            const isSelected = selectedSubjects.includes(subject);
            return (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleSubject(subject)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`subject-${subject}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {subject}
                </Label>
              </div>
            );
          })}
        </div>
        {errors.subjects && (
          <p className="text-sm text-destructive">{errors.subjects.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="study_style">Study Style</Label>
        <Select
          value={watch("study_style")}
          onValueChange={(value) => setValue("study_style", value)}
          disabled={disabled}
        >
          <SelectTrigger id="study_style" className="w-full">
            <SelectValue placeholder="Select your preferred study style" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_STYLES.map((style) => (
              <SelectItem key={style} value={style}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.study_style && (
          <p className="text-sm text-destructive">
            {errors.study_style.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Available Days</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select the days you&apos;re available for study sessions
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            return (
              <div
                key={day.value}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`day-${day.value}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleDay(day.value)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`day-${day.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            );
          })}
        </div>
        {errors.days_of_week && (
          <p className="text-sm text-destructive">
            {errors.days_of_week.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Study Periods</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select your preferred study periods (select all that apply)
          </p>
        </div>
        <div className="space-y-3">
          {STUDY_PERIODS.map((period) => {
            const isSelected = selectedStudyPeriods.includes(period.value);
            return (
              <div
                key={period.value}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`period-${period.value}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleStudyPeriod(period.value)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`period-${period.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {period.label}
                </Label>
              </div>
            );
          })}
        </div>
        {errors.study_times && (
          <p className="text-sm text-destructive">
            {errors.study_times.message}
          </p>
        )}
      </div>
    </form>
  );
}

