"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, ChevronUp } from "lucide-react";

interface CalendarColor {
  id: number;
  userId: string;
  category: string;
  bg_color: string;
  text_color: string;
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  "activity": "Strava Activities",
  "workout.upcoming": "Workout - Upcoming",
  "workout.completed": "Workout - Completed",
  "media": "Media (Movies/TV/Books/Games)",
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
      showMessage("error", "Failed to load calendar colors");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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

  const handleSave = async () => {
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

      const data = await response.json();

      if (response.ok) {
        showMessage("success", data.message);
        await fetchColors();
      } else {
        showMessage("error", data.error || "Failed to save colors");
      }
    } catch (error) {
      console.error("Error saving colors:", error);
      showMessage("error", "Failed to save colors");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/api/settings/calendar-colors", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", data.message);
        await fetchColors();
      } else {
        showMessage("error", data.error || "Failed to reset colors");
      }
    } catch (error) {
      console.error("Error resetting colors:", error);
      showMessage("error", "Failed to reset colors");
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar Colors</CardTitle>
              <CardDescription>
                Customize the colors for different calendar item types. Changes will be reflected across all calendar views.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  variant="outline"
                  onClick={() => setResetDialogOpen(true)}
                  disabled={saving || loading}
                >
                  Reset to Defaults
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading colors...</div>
            ) : (
              <>
                {/* Success/Error Message */}
                {message && (
                  <div className={`p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm">
                    <div>Category</div>
                    <div>Preview</div>
                    <div>Background Color</div>
                    <div>Text Color</div>
                  </div>

                  {/* Color rows */}
                  {colors.map((color) => {
                    const bgValue = getCurrentValue(color.category, "bg_color");
                    const textValue = getCurrentValue(color.category, "text_color");

                    return (
                      <div key={color.category} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-b-0">
                        <div className="font-medium text-sm">
                          {CATEGORY_LABELS[color.category] || color.category}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded", bgValue)} />
                          <span className={cn("text-sm font-medium", textValue)}>
                            Text
                          </span>
                        </div>
                        <Input
                          value={bgValue}
                          onChange={(e) => handleColorChange(color.category, "bg_color", e.target.value)}
                          placeholder="e.g., bg-orange-500"
                          className="font-mono text-sm"
                        />
                        <Input
                          value={textValue}
                          onChange={(e) => handleColorChange(color.category, "text_color", e.target.value)}
                          placeholder="e.g., text-orange-500"
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Use Tailwind color classes. Examples: bg-blue-500, text-red-600, bg-emerald-400
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Colors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all calendar colors to their default values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
