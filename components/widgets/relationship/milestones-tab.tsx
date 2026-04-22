"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Trash2, Edit, Calendar } from "lucide-react";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { MobileMilestoneSheet } from "./mobile-milestone-sheet";
import { EditMilestoneDialog } from "./edit-milestone-dialog";
import { MilestoneTypeIcon } from "./milestone-type-icon";
import { MilestoneCardBackground } from "./milestone-card-background";
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Anniversary: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      Achievement: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      Travel: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      "Life Transition": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      Other: "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    };
    return colors[category] || colors.Other;
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


  return (
    <>
      <div className="space-y-12">
        {/* Latest Major Milestone Hero */}
        {milestones.length > 0 && (
          <section className="mb-20">
            <div className="group relative overflow-hidden rounded-[32px] bg-zinc-900 text-white shadow-2xl min-h-[500px] flex items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-primary/20 opacity-90 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
                alt="Latest Milestone"
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="relative z-20 p-12 lg:p-20 flex flex-col items-start justify-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white font-font-lexend">Latest Major Milestone</span>
                </div>
                <h3 className="text-5xl md:text-7xl font-playfair font-bold mb-6 italic leading-tight">
                  {milestones[0].title}
                </h3>
                <div className="flex items-center gap-6 mb-8 opacity-90">
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">{formatDateLongSafe(milestones[0].date, "en-US")}</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getCategoryColor(milestones[0].category)}`}>
                    {milestones[0].category}
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-light max-w-2xl text-white/80 leading-relaxed mb-10 italic font-playfair">
                  {milestones[0].description || "A beautiful moment etched into our shared history."}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setEditingMilestone(milestones[0])}
                    className="bg-white text-zinc-900 font-bold px-8 py-6 rounded-2xl hover:bg-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="h-5 w-5" /> Edit Memory
                  </Button>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    variant="outline"
                    className="bg-primary/20 backdrop-blur-md text-white border border-white/20 font-bold px-8 py-6 rounded-2xl hover:bg-primary/40 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-5 w-5" /> New Chapter
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Chapters Timeline List */}
        <section className="relative">
          <div className="flex items-center justify-between mb-12">
            <h4 className="text-3xl font-playfair font-bold text-foreground italic">The Chapters of Our Story</h4>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary text-primary-foreground rounded-full px-6 py-2 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Milestone
            </Button>
          </div>

          <div className="relative pl-12 rel-timeline-line space-y-16 pb-20 ml-4">
            {milestones.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground glass-card rounded-2xl border-2 border-dashed">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-playfair italic">Our story is just beginning</p>
                <p className="text-sm mt-2">Record the big moments and small victories.</p>
              </div>
            ) : (
              milestones.map((milestone, idx) => (
                <div key={milestone.id} className="relative group">
                  <div className="absolute -left-[54px] top-0 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform">
                    <MilestoneTypeIcon category={milestone.category} className="h-5 w-5 text-primary" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-3 pt-2">
                      <span className="text-sm font-bold text-primary uppercase tracking-widest block mb-1 font-font-lexend">
                        {formatDateLongSafe(milestone.date, "en-US")}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getCategoryColor(milestone.category)}`}>
                        {milestone.category}
                      </span>
                    </div>
                    <div className="md:col-span-9 bg-card p-8 rounded-[2rem] border border-border hover:border-primary/50 transition-all hover:shadow-xl shadow-sm relative overflow-hidden group-hover:bg-muted/30">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="text-3xl font-playfair font-bold">{milestone.title}</h5>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMilestone(milestone)}
                            className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(milestone.id)}
                            className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-light">
                        {milestone.description || "A chapter waiting to be written in more detail."}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                          <Star className="h-3 w-3" /> Special Moment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

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
    </>
  );
}
