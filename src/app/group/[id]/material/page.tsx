"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { ArrowLeft, Search, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAllStores } from "@/store";
import { MaterialCard } from "@/components/material/MaterialCard";
import { MaterialCreateDialog } from "@/components/material/MaterialCreateDialog";

interface Group {
  id: number;
  name: string;
  description: string | null;
}

export default function GroupMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { groupMaterial, materialsLoading, initializeMaterials } =
    useAllStores();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const groupId = params.id as string;
  const numericGroupId = parseInt(groupId);

  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId || isNaN(numericGroupId)) {
        toast.error("Invalid group ID");
        router.push("/dashboard");
        return;
      }

      setIsLoadingGroup(true);
      try {
        const supabase = createClient();
        const { data: groupData, error } = await supabase
          .from("groups")
          .select("id, name, description")
          .eq("id", numericGroupId)
          .single();

        if (error || !groupData) {
          toast.error("Group not found");
          router.push("/dashboard");
          return;
        }

        setGroup(groupData);
      } catch (error) {
        console.error("Error fetching group:", error);
        toast.error("Failed to load group");
        router.push("/dashboard");
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchGroup();
  }, [groupId, numericGroupId, router]);

  // Initialize materials when group is loaded
  useEffect(() => {
    if (!isLoadingGroup && group && !isNaN(numericGroupId)) {
      initializeMaterials(numericGroupId);
    }
  }, [isLoadingGroup, group, numericGroupId, initializeMaterials]);

  // Filter materials based on search query
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupMaterial;
    }

    const query = searchQuery.toLowerCase();
    return groupMaterial.filter(
      (material) =>
        material.title.toLowerCase().includes(query) ||
        material.content.toLowerCase().includes(query)
    );
  }, [groupMaterial, searchQuery]);

  if (isLoadingGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card className="p-6">
          <p className="text-muted-foreground">Group not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/group/${groupId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Group Material
        </h1>
      </div>

      {/* Group Info Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">{group.name}</h2>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search materials by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Materials List */}
      <div className="space-y-4">
        {materialsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery
                  ? "No materials found matching your search"
                  : "No materials uploaded yet"}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Materials uploaded by group members will appear here"}
              </EmptyDescription>
            </EmptyHeader>
            {!searchQuery && (
              <EmptyContent>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!materialsLoading && filteredMaterials.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Create Material Dialog */}
      {group && (
        <MaterialCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          groupId={numericGroupId}
        />
      )}
    </div>
  );
}
