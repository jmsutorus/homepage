"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Lock, Clock, Star, Trash2, Edit, ShieldAlert, MapPin, Calendar } from "lucide-react";
import { CreateIntimacyDialog } from "./create-intimacy-dialog";
import { MobileIntimacySheet } from "./mobile-intimacy-sheet";
import { EditIntimacyDialog } from "./edit-intimacy-dialog";
import { IntimacyCardBackground } from "./intimacy-card-background";
import { CowgirlIcon } from "./positions/cowgirl-icon";
import { DoggyIcon } from "./positions/doggy-icon";
import { MissionaryIcon } from "./positions/missionary-icon";
import { ReverseCowgirlIcon } from "./positions/reverse-cowgirl-icon";
import { SpooningIcon } from "./positions/spooning-icon";
import { StandingIcon } from "./positions/standing-icon";
import { WheelbarrowIcon } from "./positions/wheelbarrow-icon";
import { FaceSitterIcon } from "./positions/face-sitter-icon";
import { HotSeatIcon } from "./positions/hot-seat-icon";
import { LapDanceIcon } from "./positions/lap-dance-icon";
import { BeesKneesIcon } from "./positions/bees-knees-icon";
import { MountainClimberIcon } from "./positions/mountain-climber-icon";
import { PretzelIcon } from "./positions/pretzel-icon";
import { StandingDragonIcon } from "./positions/standing-dragon-icon";
import { BicycleIcon } from "./positions/bicycle-icon";
import { ButterChurnerIcon } from "./positions/butter-churner-icon";
import { CaptainIcon } from "./positions/captain-icon";
import { BalletDancerIcon } from "./positions/ballet-dancer-icon";
import { DownwardDogIcon } from "./positions/downward-dog-icon";
import { LoveSeatIcon } from "./positions/love-seat-icon";
import { LazyManIcon } from "./positions/lazy-man-icon";
import { AnvilIcon } from "./positions/anvil-icon";
import type { IntimacyEntry } from "@/lib/db/relationship";
import { formatDateLongSafe } from "@/lib/utils";
import { toast } from "sonner";

const POSITION_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "Cowgirl": CowgirlIcon,
  "Doggy": DoggyIcon,
  "Doggy Style": DoggyIcon,
  "Missionary": MissionaryIcon,
  "Reverse Cowgirl": ReverseCowgirlIcon,
  "Spooning": SpooningIcon,
  "Standing": StandingIcon,
  "Wheelbarrow": WheelbarrowIcon,
  "Face Sitter": FaceSitterIcon,
  "Hot Seat": HotSeatIcon,
  "Lap Dance": LapDanceIcon,
  "Bees Knees": BeesKneesIcon,
  "Mountain Climber": MountainClimberIcon,
  "Pretzel": PretzelIcon,
  "Standing Dragon": StandingDragonIcon,
  "Bicycle": BicycleIcon,
  "Butter Churner": ButterChurnerIcon,
  "Captain": CaptainIcon,
  "Ballet Dancer": BalletDancerIcon,
  "Downward Dog": DownwardDogIcon,
  "Love Seat": LoveSeatIcon,
  "Lazy Man": LazyManIcon,
  "Anvil": AnvilIcon,
};

interface IntimacyTabProps {
  initialData: IntimacyEntry[];
  onRefresh: () => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

export function IntimacyTab({
  initialData,
  onRefresh,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: IntimacyTabProps) {
  const [entries, setEntries] = useState(initialData);
  const [editingEntry, setEditingEntry] = useState<IntimacyEntry | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEntryAdded = () => {
    onRefresh();
    fetchEntries();
  };

  const handleEntryUpdated = () => {
    onRefresh();
    fetchEntries();
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/relationship/intimacy");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch intimacy entries:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this private entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/relationship/intimacy/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Entry deleted successfully");
        fetchEntries();
        onRefresh();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Private & Secure Banner */}
          <div className="flex items-center justify-between bg-zinc-900/5 dark:bg-white/5 border border-border p-4 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Private & Secure</h3>
                <p className="text-xs text-muted-foreground">Only you can see this section of your dashboard.</p>
              </div>
            </div>
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Header with Add Button */}
          <div className="flex items-center justify-between mt-10">
            <div>
              <h2 className="text-2xl font-playfair font-bold italic">Intimacy Tracking</h2>
              <p className="text-sm text-muted-foreground">Sacred moments in your connection.</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Add Entry
            </Button>
          </div>

          {/* Entry List */}
          <div className="space-y-6">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground glass-card rounded-2xl border-2 border-dashed">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-playfair italic">No shared moments recorded yet</p>
                <p className="text-sm mt-2">Begin your private history today.</p>
              </div>
            ) : (
              entries.map((entry) => {
                let positions: string[] = [];
                try {
                  if (entry.positions) {
                    positions = typeof entry.positions === 'string' 
                      ? JSON.parse(entry.positions) 
                      : entry.positions;
                  }
                } catch (e) {
                  console.error("Failed to parse positions", e);
                }

                return (
                  <div key={entry.id} className="p-6 rounded-2xl glass-card shadow-sm border border-border hover:border-primary/30 transition-all duration-500 group relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shadow-sm shrink-0">
                          <Heart className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                          <h4 className="text-lg font-playfair font-bold">{formatDateLongSafe(entry.date, "en-US")}</h4>
                          <p className="text-xs text-muted-foreground">Logged at {entry.time || "Unknown Time"}</p>
                        </div>
                      </div>
                      <div className="heart-rating flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`h-5 w-5 ${
                              i < (entry.satisfaction_rating || 0)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {entry.duration && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/50 text-muted-foreground border border-border rounded-full text-xs font-medium">
                          <Clock className="h-3.3 w-3.5" /> {entry.duration} min
                        </span>
                      )}
                      {entry.initiation && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/50 text-muted-foreground border border-border rounded-full text-xs font-medium">
                          <Plus className="h-3.5 w-3.5" /> Initiated by: {entry.initiation === "me" ? "You" : entry.initiation}
                        </span>
                      )}
                      {entry.location && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-full text-xs font-medium">
                          <MapPin className="h-3.5 w-3.5" /> {entry.location}
                        </span>
                      )}
                      {positions.map((pos) => {
                        const Icon = POSITION_ICONS[pos];
                        return (
                          <span key={pos} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-xs font-medium">
                            {Icon ? <Icon className="h-4 w-4" /> : <Heart className="h-3.5 w-3.5" />}
                            {pos}
                          </span>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-2 font-font-lexend">Before Reflection</span>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">"{entry.mood_before || "No reflection recorded."}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-2 font-font-lexend">After Reflection</span>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">"{entry.mood_after || "No reflection recorded."}"</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEntry(entry)}
                        className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-12 text-center">
            <p className="text-muted-foreground font-playfair italic text-lg opacity-60">
              "Intimacy is not purely physical. It's the act of connecting with another soul."
            </p>
          </div>
        </div>

        {/* Insights Sidebar */}
        <aside className="xl:w-80 space-y-4 shrink-0">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4 font-font-lexend">Insights</h3>
          <div className="p-6 glass-card rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-font-lexend">Total Entries</span>
            </div>
            <div className="text-3xl font-playfair font-bold">{entries.length}</div>
          </div>
          <div className="p-6 glass-card rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-font-lexend">Top Mood</span>
            </div>
            <div className="text-3xl font-playfair font-bold">Peaceful</div>
          </div>
          <div className="p-6 glass-card rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-font-lexend">Avg Duration</span>
            </div>
            <div className="text-3xl font-playfair font-bold">25 min</div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-2">Connection Goal</h4>
            <div className="w-full bg-background dark:bg-zinc-800 rounded-full h-1.5 mb-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-[11px] text-muted-foreground">3 of 4 moments shared this week</p>
          </div>
        </aside>
      </div>

      {/* Create Dialog/Sheet - Mobile uses Sheet, Desktop uses Dialog */}
      {isMobile ? (
        <MobileIntimacySheet
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onEntryAdded={handleEntryAdded}
        />
      ) : (
        <CreateIntimacyDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onEntryAdded={handleEntryAdded}
        />
      )}

      {/* Edit Dialog */}
      {editingEntry && (
        <EditIntimacyDialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          entry={editingEntry}
          onEntryUpdated={handleEntryUpdated}
        />
      )}
    </>
  );
}
