"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  Settings,
  User,
  LogOut,
  Folder,
  Calendar,
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
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllStores } from "@/store";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Group {
  id: number;
  name: string;
  description: string | null;
}

export function GroupSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { state } = useSidebar();
  const { user, signOut, isLoading } = useAllStores();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);

  const groupId = params.id as string;

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;

      setIsLoadingGroup(true);
      try {
        const supabase = createClient();
        const { data: groupData, error } = await supabase
          .from("groups")
          .select("id, name, description")
          .eq("id", parseInt(groupId))
          .single();

        if (error || !groupData) {
          console.error("Error fetching group:", error);
          setGroup(null);
        } else {
          setGroup(groupData);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
        setGroup(null);
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: `/group/${groupId}`,
    },
    {
      title: "Members",
      icon: Users,
      href: `/group/${groupId}/members`,
    },
    {
      title: "Material",
      icon: BookOpen,
      href: `/group/${groupId}/material`,
    },
    {
      title: "Quizzes",
      icon: FileQuestion,
      href: `/group/${groupId}/quizzes`,
    },
    {
      title: "Collection",
      icon: Folder,
      href: `/group/${groupId}/collection`,
    },
    {
      title: "Sessions",
      icon: Calendar,
      href: `/group/${groupId}/sessions`,
    }
  ];

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

  // Check if current pathname matches a navigation item
  const isActive = (href: string) => {
    if (href === `/group/${groupId}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <Image
                  src="/logo.png"
                  alt="StdntLAB Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  priority
                />
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
              {isLoadingGroup ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Skeleton className="h-4 w-4" />
                    {!isCollapsed && <Skeleton className="h-4 w-20 ml-2" />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : group ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="lg" className="mb-2">
                    <div>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <Users className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm truncate">
                            {group.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Group
                          </span>
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
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
