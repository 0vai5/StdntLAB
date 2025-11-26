"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <p className="text-muted-foreground">
          Configure your account settings, preferences, and application
          preferences here.
        </p>
      </div>
    </div>
  );
}

