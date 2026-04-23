"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Palette, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface CalendarColor {
  id: number;
  userId: string;
  category: string;
  bg_color: string;
  text_color: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  "activity": "Strava Activities",
  "workout.upcoming": "Workout - Upcoming",
  "workout.completed": "Workout - Completed",
  "media": "Media Items",
  "park": "Parks",
  "journal": "Journals",
  "event": "Events",
  "task.overdue": "Task - Overdue",
  "task.upcoming": "Task - Upcoming",
  "task.completed": "Task - Completed",
  "github": "GitHub Events",
  "habit": "Habits",
  "goal.due": "Goal - Due",
  "goal.completed": "Goal - Completed",
  "milestone.due": "Milestone - Due",
  "milestone.completed": "Milestone - Completed",
};

export function CalendarColorsManager() {
  const [colors, setColors] = useState<CalendarColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editedColors, setEditedColors] = useState<Record<string, { bg_color: string; text_color: string }>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/calendar-colors");
      const data = await response.json();
      setColors(data.colors || []);
      setEditedColors({});
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("Failed to load calendar colors");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (category: string, field: "bg_color" | "text_color", value: string) => {
    setEditedColors((prev) => {
      const currentColor = colors.find((c) => c.category === category);
      return {
        ...prev,
        [category]: {
          bg_color: field === "bg_color" ? value : (prev[category]?.bg_color || currentColor?.bg_color || ""),
          text_color: field === "text_color" ? value : (prev[category]?.text_color || currentColor?.text_color || ""),
        },
      };
    });
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      const colorsToUpdate = Object.entries(editedColors).map(([category, { bg_color, text_color }]) => ({
        category,
        bg_color,
        text_color,
      }));

      const response = await fetch("/api/settings/calendar-colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: colorsToUpdate }),
      });

      if (response.ok) {
        toast.success("Calendar colors updated successfully");
        await fetchColors();
      } else {
        toast.error("Failed to save colors");
      }
    } catch (error) {
      console.error("Error saving colors:", error);
      toast.error("Failed to save colors");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/api/settings/calendar-colors", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Calendar colors reset to defaults");
        await fetchColors();
      } else {
        toast.error("Failed to reset colors");
      }
    } catch (error) {
      console.error("Error resetting colors:", error);
      toast.error("Failed to reset colors");
    } finally {
      setResetDialogOpen(false);
    }
  };

  const getCurrentValue = (category: string, field: "bg_color" | "text_color"): string => {
    if (editedColors[category]) {
      return editedColors[category][field];
    }
    const color = colors.find((c) => c.category === category);
    return color ? color[field] : "";
  };

  const hasChanges = Object.keys(editedColors).length > 0;

  return (
    <div className="space-y-3">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-media-surface border border-media-outline-variant/20 hover:border-media-primary/40 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-media-surface-variant rounded-full">
            <Palette className="h-5 w-5 text-media-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-media-on-surface text-sm">Calendar Theme</span>
            <span className="text-xs text-media-on-surface-variant">Customize item categorization colors</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-media-primary text-media-on-primary"
            >
              Save
            </Button>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 rounded-lg bg-media-surface-variant/30 border border-media-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-media-on-surface-variant italic">
              Use Tailwind classes (e.g. bg-blue-500, text-white) to style calendar categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="h-8 text-[10px] font-bold uppercase tracking-widest border-media-outline-variant/40"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="h-40 flex items-center justify-center text-media-on-surface-variant text-sm">Loading...</div>
            ) : (
              colors.map((color) => {
                const bgValue = getCurrentValue(color.category, "bg_color");
                const textValue = getCurrentValue(color.category, "text_color");

                return (
                  <div key={color.category} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center p-3 rounded-lg bg-media-surface/50 border border-media-outline-variant/10">
                    <div className="text-xs font-bold text-media-on-surface">
                      {CATEGORY_LABELS[color.category] || color.category}
                    </div>
                    <div className="flex items-center justify-center">
                      <div className={cn("px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter", bgValue, textValue)}>
                        Preview
                      </div>
                    </div>
                    <Input
                      value={bgValue}
                      onChange={(e) => handleColorChange(color.category, "bg_color", e.target.value)}
                      placeholder="Background class"
                      className="h-8 text-[10px] bg-media-surface border-media-outline-variant/30"
                    />
                    <Input
                      value={textValue}
                      onChange={(e) => handleColorChange(color.category, "text_color", e.target.value)}
                      placeholder="Text class"
                      className="h-8 text-[10px] bg-media-surface border-media-outline-variant/30"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-media-surface border-media-outline-variant/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-media-on-surface">Reset Calendar Colors</AlertDialogTitle>
            <AlertDialogDescription className="text-media-on-surface-variant">
              This will restore all calendar item categories to their default thematic colors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-media-outline-variant/40 text-media-on-surface hover:bg-media-surface-variant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-media-error text-white"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

