"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { signOut } = useAllStores();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
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
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
