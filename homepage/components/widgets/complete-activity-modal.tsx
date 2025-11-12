"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Activity } from "lucide-react";

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
}

interface WorkoutActivity {
  id: number;
  date: string;
  time: string;
  length: number;
  difficulty: "easy" | "moderate" | "hard" | "very hard";
  type: "cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other";
  exercises: string;
  notes?: string;
  completed: boolean;
}

interface CompleteActivityModalProps {
  activity: WorkoutActivity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityCompleted?: () => void;
}

export function CompleteActivityModal({
  activity,
  isOpen,
  onOpenChange,
  onActivityCompleted,
}: CompleteActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStrava, setLoadingStrava] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [stravaActivities, setStravaActivities] = useState<StravaActivity[]>([]);
  const [selectedStravaId, setSelectedStravaId] = useState<string>("");

  // Fetch Strava activities when modal opens and we have an activity
  useEffect(() => {
    if (isOpen && activity) {
      fetchStravaActivities();
      setCompletionNotes("");
      setSelectedStravaId("");
    }
  }, [isOpen, activity]);

  const fetchStravaActivities = async () => {
    if (!activity) return;

    try {
      setLoadingStrava(true);
      const response = await fetch(`/api/strava/activities/by-date?date=${activity.date}`);

      if (response.ok) {
        const data = await response.json();
        setStravaActivities(data.activities || []);

        // Auto-select if only one activity
        if (data.activities && data.activities.length === 1) {
          setSelectedStravaId(data.activities[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching Strava activities:", error);
    } finally {
      setLoadingStrava(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    setLoading(true);

    try {
      const response = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activity.id,
          strava_activity_id: selectedStravaId ? parseInt(selectedStravaId) : null,
          completion_notes: completionNotes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark activity as complete");
      }

      // Reset form and close modal
      setCompletionNotes("");
      setSelectedStravaId("");
      onOpenChange(false);
      onActivityCompleted?.();
    } catch (error) {
      console.error("Error marking activity as complete:", error);
      alert("Failed to mark activity as complete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Mark Activity Complete
          </DialogTitle>
          <DialogDescription>
            Complete your workout activity and optionally link it to a Strava activity
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{activity.date} at {activity.time}</p>
            <p className="text-sm text-muted-foreground">
              {activity.length} minutes • {activity.type} • {activity.difficulty}
            </p>
          </div>

          {/* Strava Activity Selection */}
          <div className="space-y-2">
            <Label htmlFor="strava-activity">Link Strava Activity (Optional)</Label>
            {loadingStrava ? (
              <div className="text-sm text-muted-foreground">Loading Strava activities...</div>
            ) : stravaActivities.length > 0 ? (
              <Select value={selectedStravaId} onValueChange={setSelectedStravaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Strava activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Strava activity</SelectItem>
                  {stravaActivities.map((stravaActivity) => (
                    <SelectItem key={stravaActivity.id} value={stravaActivity.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        <span className="truncate">{stravaActivity.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatDistance(stravaActivity.distance)} • {formatDuration(stravaActivity.moving_time)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No Strava activities found for this date
              </div>
            )}
            {stravaActivities.length === 1 && selectedStravaId && (
              <p className="text-xs text-muted-foreground">
                ✓ Automatically selected (only one activity on this date)
              </p>
            )}
          </div>

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="completion-notes">Post-Activity Notes (Optional)</Label>
            <Textarea
              id="completion-notes"
              placeholder="How did it go? Any observations or thoughts..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Completing..." : "Mark Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
