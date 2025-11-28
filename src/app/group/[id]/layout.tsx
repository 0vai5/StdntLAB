"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAllStores } from "@/store";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { GroupSidebar } from "@/components/sidebar/GroupSidebar";
import { GroupSwitcherDropdown } from "@/components/sidebar/GroupSwitcherDropdown";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const {
    signOut,
    user,
    isLoading: isUserLoading,
    isInitialized,
    groupsLoading,
    groupsInitialized,
    initializeGroups,
  } = useAllStores();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const groupId = params.id as string;
  const currentGroupId = isNaN(parseInt(groupId)) ? null : parseInt(groupId);

  // Initialize groups if not already initialized
  useEffect(() => {
    // Wait for auth to initialize before checking user
    if (!isInitialized || isUserLoading) {
      return;
    }
    if (user?.id && !groupsLoading && !groupsInitialized) {
      const numericUserId =
        typeof user.id === "number" ? user.id : parseInt(user.id || "0");
      if (!isNaN(numericUserId)) {
        initializeGroups(numericUserId);
      }
    }
  }, [user?.id, groupsLoading, groupsInitialized, initializeGroups, isInitialized, isUserLoading]);

  // Check if user is a valid member of the group
  useEffect(() => {
    const checkMembership = async () => {
      // Wait for auth to initialize before checking user
      if (!isInitialized || isUserLoading) {
        return;
      }

      // If no user, redirect to dashboard (auth guard should handle sign in, but redirect here for safety)
      if (!user) {
        router.push("/dashboard");
        return;
      }

      if (!groupId) {
        router.push("/dashboard");
        return;
      }

      setIsCheckingMembership(true);

      try {
        const supabase = createClient();
        const numericGroupId = parseInt(groupId);

        if (isNaN(numericGroupId)) {
          toast.error("Invalid group ID");
          router.push("/dashboard");
          return;
        }

        // Get numeric user ID
        const numericUserId =
          typeof user.id === "number" ? user.id : parseInt(user.id || "0");

        if (!numericUserId || isNaN(numericUserId)) {
          toast.error("User ID not found. Please refresh and try again.");
          router.push("/dashboard");
          return;
        }

        // Check if user is a member of the group
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", numericGroupId)
          .eq("user_id", numericUserId)
          .single();

        if (memberError || !memberData) {
          // User is not a member
          toast.error("You are not a member of this group");
          router.push("/dashboard");
          return;
        }

        // User is a valid member
        setIsMember(true);
      } catch (error) {
        console.error("Error checking membership:", error);
        toast.error("Failed to verify group membership");
        router.push("/dashboard");
      } finally {
        setIsCheckingMembership(false);
      }
    };

    checkMembership();
  }, [groupId, user, isUserLoading, router, isInitialized]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Redirect immediately before showing toast
      router.replace("/auth/signin");
      router.refresh();
      // Show toast after redirect starts (non-blocking)
      setTimeout(() => {
        toast.success("Signed out successfully");
      }, 0);
    } catch (error) {
      toast.error("Error signing out");
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  // Show loading state while checking membership or user loading
  if (isCheckingMembership || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">
            Verifying group membership...
          </p>
        </div>
      </div>
    );
  }

  // Only render if user is a valid member
  if (!isMember) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <SidebarProvider>
      <GroupSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <GroupSwitcherDropdown currentGroupId={currentGroupId} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="h-9 w-9"
            >
              {isSigningOut ? (
                <Spinner size="sm" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
