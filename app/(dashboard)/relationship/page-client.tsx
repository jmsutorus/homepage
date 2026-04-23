"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { Heart, Lock, Calendar, Settings, Plus, Star } from "lucide-react";
import { DatesTab } from "@/components/widgets/relationship/dates-tab";
import { IntimacyTab } from "@/components/widgets/relationship/intimacy-tab";
import { MilestonesTab } from "@/components/widgets/relationship/milestones-tab";
import { ManageTab } from "@/components/widgets/relationship/manage-tab";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type {
  RelationshipDate,
  IntimacyEntry,
  RelationshipMilestone,
  RelationshipStats,
} from "@/lib/db/relationship";

type ViewTab = "dates" | "intimacy" | "milestones" | "manage";

interface RelationshipPageClientProps {
  initialDates: RelationshipDate[];
  initialIntimacy: IntimacyEntry[];
  initialMilestones: RelationshipMilestone[];
  stats: RelationshipStats;
  userId: string;
}

export function RelationshipPageClient({
  initialDates,
  initialIntimacy,
  initialMilestones,
  stats: initialStats,
}: RelationshipPageClientProps) {
  const [dates, setDates] = useState(initialDates);
  const [intimacyEntries, setIntimacyEntries] = useState(initialIntimacy);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [stats, setStats] = useState(initialStats);
  const [viewTab, setViewTab] = useState<ViewTab>("dates");

  // Create dialog states for mobile FAB
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isIntimacyDialogOpen, setIsIntimacyDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);

  // Handle FAB click based on current tab
  const handleAddClick = () => {
    switch (viewTab) {
      case "dates":
        setIsDateDialogOpen(true);
        break;
      case "intimacy":
        setIsIntimacyDialogOpen(true);
        break;
      case "milestones":
        setIsMilestoneDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Refresh stats function
  const refreshStats = async () => {
    try {
      const response = await fetch("/api/relationship/stats");
      if (response.ok) {
        const newStats = await response.json();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  };

  // Refresh dates list
  const refreshDates = async () => {
    try {
      const response = await fetch("/api/relationship/dates");
      if (response.ok) {
        const newDates = await response.json();
        setDates(newDates);
        await refreshStats();
      }
    } catch (error) {
      console.error("Failed to refresh dates:", error);
    }
  };

  // Refresh intimacy entries list
  const refreshIntimacy = async () => {
    try {
      const response = await fetch("/api/relationship/intimacy");
      if (response.ok) {
        const newEntries = await response.json();
        setIntimacyEntries(newEntries);
        await refreshStats();
      }
    } catch (error) {
      console.error("Failed to refresh intimacy entries:", error);
    }
  };

  // Refresh milestones list
  const refreshMilestones = async () => {
    try {
      const response = await fetch("/api/relationship/milestones");
      if (response.ok) {
        const newMilestones = await response.json();
        setMilestones(newMilestones);
        await refreshStats();
      }
    } catch (error) {
      console.error("Failed to refresh milestones:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-playfair font-bold text-primary leading-tight">Relationship Tracker</h1>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Capturing the grand chapters and quiet moments of our journey through life together.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold font-font-lexend">Total Dates</span>
            <Calendar className="h-4 w-4 text-primary/50" />
          </div>
          <div className="text-3xl font-playfair font-bold">{stats.totalDates}</div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold font-font-lexend">Intimacy Entries</span>
            <Heart className="h-4 w-4 text-primary/50" />
          </div>
          <div className="text-3xl font-playfair font-bold">{stats.totalIntimacy}</div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold font-font-lexend">Milestones</span>
            <Lock className="h-4 w-4 text-primary/50" />
          </div>
          <div className="text-3xl font-playfair font-bold">{stats.totalMilestones}</div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold font-font-lexend">Avg Rating</span>
            <Star className="h-4 w-4 text-primary/50" />
          </div>
          <div className="text-3xl font-playfair font-bold">{stats.avgDateRating.toFixed(1)}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "dates", label: "Dates", icon: Calendar, showLabel: false },
            { value: "intimacy", label: "Intimacy", icon: Heart, showLabel: false },
            { value: "milestones", label: "Milestones", icon: Lock, showLabel: false },
            { value: "manage", label: "Manage", icon: Settings, showLabel: false },
          ]}
        />

        <TabsContent value="dates" className="space-y-6 mt-6 pb-20 md:pb-0">
          <DatesTab
            initialData={dates}
            onRefresh={refreshDates}
            isCreateDialogOpen={isDateDialogOpen}
            setIsCreateDialogOpen={setIsDateDialogOpen}
          />
        </TabsContent>

        <TabsContent value="intimacy" className="space-y-6 mt-6 pb-20 md:pb-0">
          <IntimacyTab
            initialData={intimacyEntries}
            onRefresh={refreshIntimacy}
            isCreateDialogOpen={isIntimacyDialogOpen}
            setIsCreateDialogOpen={setIsIntimacyDialogOpen}
          />
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6 mt-6 pb-20 md:pb-0">
          <MilestonesTab
            initialData={milestones}
            onRefresh={refreshMilestones}
            isCreateDialogOpen={isMilestoneDialogOpen}
            setIsCreateDialogOpen={setIsMilestoneDialogOpen}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 mt-6 pb-20 md:pb-0">
          <ManageTab/>
        </TabsContent>
      </Tabs>
      {viewTab !== "manage" && (
        <FloatingActionButton 
          onClick={handleAddClick}
          tooltipText={
            viewTab === "dates" ? "Add Date" : 
            viewTab === "intimacy" ? "Log Intimacy" : 
            "Add Milestone"
          }
        />
      )}
    </div>
  );
}
