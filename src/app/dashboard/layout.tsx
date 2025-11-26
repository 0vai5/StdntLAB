"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllStores } from "@/store";
import { toast } from "sonner";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/dashboard/calendar",
  },
  {
    title: "Todo",
    icon: CheckSquare,
    href: "/dashboard/todo",
  },
  {
    title: "My Progress",
    icon: TrendingUp,
    href: "/dashboard/progress",
  },
];

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { user, signOut, isLoading } = useAllStores();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

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

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">SL</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">StdntLAB</span>
                  <span className="text-xs text-muted-foreground">
                    {isCollapsed ? "" : "Student Lab"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      {!isCollapsed && (
                        <div className="flex flex-col gap-0.5 text-left">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.name || user?.email} />
                        <AvatarFallback>
                          {getInitials(user?.name, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="text-sm font-semibold">
                            {user?.name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isCollapsed ? "right" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-0.5">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user?.name || user?.email} />
                          <AvatarFallback>
                            {getInitials(user?.name, user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">
                            {user?.name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  variant="destructive"
                >
                  {isSigningOut ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <LogOut />
                  )}
                  <span>{isSigningOut ? "Signing out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

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
      toast.success("Signed out successfully");
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
      console.error("Error signing out:", error);
    } finally {
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
