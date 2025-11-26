"use client";

import { User } from "lucide-react";
import { useAllStores } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAllStores();

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
        <div className="flex flex-col items-center gap-4">
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
        </div>
      </div>
    </div>
  );
}

