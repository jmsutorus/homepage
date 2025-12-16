"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Calendar, Trash2, Edit } from "lucide-react";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { MobileMilestoneSheet } from "./mobile-milestone-sheet";
import { EditMilestoneDialog } from "./edit-milestone-dialog";
import type { RelationshipMilestone } from "@/lib/db/relationship";
import { formatDateLongSafe } from "@/lib/utils";
import { toast } from "sonner";

interface MilestonesTabProps {
  initialData: RelationshipMilestone[];
  onRefresh: () => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

export function MilestonesTab({
  initialData,
  onRefresh,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: MilestonesTabProps) {
  const [milestones, setMilestones] = useState(initialData);
  const [editingMilestone, setEditingMilestone] = useState<RelationshipMilestone | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMilestoneAdded = () => {
    onRefresh();
    fetchMilestones();
  };

  const handleMilestoneUpdated = () => {
    onRefresh();
    fetchMilestones();
  };

  const fetchMilestones = async () => {
    try {
      const response = await fetch("/api/relationship/milestones");
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
    } catch (error) {
      console.error("Failed to fetch milestones:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    try {
      const response = await fetch(`/api/relationship/milestones/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Milestone deleted successfully");
        fetchMilestones();
        onRefresh();
      } else {
        toast.error("Failed to delete milestone");
      }
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      toast.error("Failed to delete milestone");
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      anniversary: "bg-pink-500",
      first: "bg-blue-500",
      achievement: "bg-green-500",
      special: "bg-purple-500",
      other: "bg-gray-500",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relationship Milestones</h2>
          <p className="text-muted-foreground">Celebrate special moments and anniversaries</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="cursor-pointer hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Timeline */}
      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No milestones recorded yet</p>
            <p className="text-sm mt-2">Start recording your special moments!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* Milestone items */}
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pl-20">
                {/* Timeline dot */}
                <div className={`absolute left-6 top-3 w-5 h-5 rounded-full border-4 border-background ${getCategoryColor(milestone.category)}`} />

                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getCategoryColor(milestone.category)} text-white`}>
                            {getCategoryLabel(milestone.category)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDateLongSafe(milestone.date, "en-US")}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMilestone(milestone)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(milestone.id)}
                          className="cursor-pointer text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {milestone.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {milestone.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Dialog/Sheet - Mobile uses Sheet, Desktop uses Dialog */}
      {isMobile ? (
        <MobileMilestoneSheet
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onMilestoneAdded={handleMilestoneAdded}
        />
      ) : (
        <CreateMilestoneDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onMilestoneAdded={handleMilestoneAdded}
        />
      )}

      {/* Edit Dialog */}
      {editingMilestone && (
        <EditMilestoneDialog
          open={!!editingMilestone}
          onOpenChange={(open) => !open && setEditingMilestone(null)}
          milestone={editingMilestone}
          onMilestoneUpdated={handleMilestoneUpdated}
        />
      )}
    </div>
  );
}
