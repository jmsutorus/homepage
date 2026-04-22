"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PersonalRecord } from "@/lib/db/personal-records";

interface EditPrModalProps {
  record: PersonalRecord;
  onSuccess?: () => void;
  children: React.ReactNode;
  enableRunning?: boolean;
  enableWeights?: boolean;
}

const DISTANCE_SHORTCUTS = [
  { label: "Marathon", value: "26.2" },
  { label: "Half", value: "13.1" },
  { label: "10K", value: "6.2" },
  { label: "5K", value: "3.1" },
  { label: "1 Mi", value: "1.0" },
];

function formatSecondsToTime(totalSeconds: number | null | undefined): string {
  if (!totalSeconds) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EditPrModal({ record, onSuccess, children, enableRunning = true, enableWeights = true }: EditPrModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"running" | "weights">(record.type);
  const [date, setDate] = useState(record.date);
  const [notes, setNotes] = useState(record.notes || "");
  
  // Running fields
  const [distance, setDistance] = useState(record.distance?.toString() || "");
  const [time, setTime] = useState(formatSecondsToTime(record.total_seconds));
  
  // Weights fields
  const [exercise, setExercise] = useState(record.exercise || "");
  const [weight, setWeight] = useState(record.weight?.toString() || "");
  const [reps, setReps] = useState(record.reps?.toString() || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let total_seconds = 0;
    if (type === "running" && time) {
      const parts = time.split(":").map(Number);
      if (parts.length === 3) {
        total_seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        total_seconds = parts[0] * 60 + parts[1];
      }
    }

    try {
      const res = await fetch(`/api/exercise/prs/${record.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          date,
          notes,
          distance: distance ? parseFloat(distance) : null,
          total_seconds: total_seconds || null,
          exercise: exercise || null,
          weight: weight ? parseFloat(weight) : null,
          reps: reps ? parseInt(reps) : null,
        }),
      });

      if (res.ok) {
        toast.success("Personal Record updated!");
        setOpen(false);
        onSuccess?.();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update PR");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this PR?")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/exercise/prs/${record.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Personal Record deleted");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const showTabsList = enableRunning && enableWeights;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Edit Personal Record</DialogTitle>
              <DialogDescription>
                Update your achievement details.
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              type="button"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Tabs value={type} onValueChange={(v) => setType(v as "running" | "weights")} className="w-full">
            {showTabsList && (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="running">Running</TabsTrigger>
                <TabsTrigger value="weights">Weights</TabsTrigger>
              </TabsList>
            )}
            
            {enableRunning && (
              <TabsContent value="running" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="distance">Distance</Label>
                    <div className="relative">
                      <Input id="distance" placeholder="0.0" value={distance} onChange={(e) => setDistance(e.target.value)} type="number" step="0.01" />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">mi</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {DISTANCE_SHORTCUTS.map(s => (
                        <Badge 
                          key={s.label} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80" 
                          onClick={() => setDistance(s.value)}
                        >
                          {s.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" placeholder="MM:SS or HH:MM:SS" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
              </TabsContent>
            )}
            
            {enableWeights && (
              <TabsContent value="weights" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise Name</Label>
                  <Input id="exercise" placeholder="e.g. Bench Press" value={exercise} onChange={(e) => setExercise(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <div className="relative">
                      <Input id="weight" placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.5" />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">lbs</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps">Reps</Label>
                    <Input id="reps" placeholder="0" value={reps} onChange={(e) => setReps(e.target.value)} type="number" />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="How did it feel?" value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? "Saving..." : "Update Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
