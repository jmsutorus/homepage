"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddPrModalProps {
  onSuccess?: () => void;
  showButton?: boolean;
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

export function AddPrModal({ onSuccess, showButton = true, enableRunning = true, enableWeights = true }: AddPrModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"running" | "weights">(enableRunning ? "running" : "weights");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  // Running fields
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState(""); // UI format (e.g., 05:30)
  
  // Weights fields
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update type if settings change while modal is open (rare but good practice)
  useEffect(() => {
    if (!enableRunning && type === "running") setType("weights");
    if (!enableWeights && type === "weights") setType("running");
  }, [enableRunning, enableWeights, type]);

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
      const res = await fetch("/api/exercise/prs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          date,
          notes,
          distance: distance ? parseFloat(distance) : undefined,
          total_seconds: total_seconds || undefined,
          exercise: exercise || undefined,
          weight: weight ? parseFloat(weight) : undefined,
          reps: reps ? parseInt(reps) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Personal Record added!");
        setOpen(false);
        // Reset form
        setDistance("");
        setTime("");
        setExercise("");
        setWeight("");
        setReps("");
        setNotes("");
        onSuccess?.();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add PR");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTabsList = enableRunning && enableWeights;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showButton && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add PR
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Personal Record</DialogTitle>
          <DialogDescription>
            Record your latest achievement to track progress over time.
          </DialogDescription>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
