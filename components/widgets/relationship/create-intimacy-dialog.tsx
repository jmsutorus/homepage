"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Star } from "lucide-react";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import type { RelationshipPosition } from "@/lib/db/relationship";

interface CreateIntimacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryAdded: () => void;
}

export function CreateIntimacyDialog({ open, onOpenChange, onEntryAdded }: CreateIntimacyDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(3);
  const [initiation, setInitiation] = useState("mutual");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("home");
  const [moodBefore, setMoodBefore] = useState("");
  const [moodAfter, setMoodAfter] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<RelationshipPosition[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onEntryAdded();
    },
  });

  // Fetch available positions when dialog opens
  useEffect(() => {
    if (open) {
      fetchPositions();
    }
  }, [open]);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/relationship/positions");
      if (response.ok) {
        const data = await response.json();
        setAvailablePositions(data);
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetSuccess();
      setTimeout(() => {
        setDate("");
        setTime("");
        setDuration("");
        setSatisfactionRating(3);
        setInitiation("mutual");
        setType("");
        setLocation("home");
        setMoodBefore("");
        setMoodAfter("");
        setPositions([]);
        setNotes("");
      }, 200);
    }
  }, [open, resetSuccess]);

  const handlePositionToggle = (positionName: string) => {
    setPositions((prev) =>
      prev.includes(positionName)
        ? prev.filter((p) => p !== positionName)
        : [...prev, positionName]
    );
  };

  const handleSave = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/relationship/intimacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: time || undefined,
          duration: duration ? parseInt(duration) : undefined,
          satisfaction_rating: satisfactionRating,
          initiation,
          type: type || undefined,
          location,
          mood_before: moodBefore || undefined,
          mood_after: moodAfter || undefined,
          positions: positions.length > 0 ? positions : undefined,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create intimacy entry");
      }

      // Reset form before showing success
      setDate("");
      setTime("");
      setDuration("");
      setSatisfactionRating(3);
      setInitiation("mutual");
      setType("");
      setLocation("home");
      setMoodBefore("");
      setMoodAfter("");
      setPositions([]);
      setNotes("");

      triggerSuccess();
    } catch (error) {
      console.error("Failed to create intimacy entry:", error);
      alert("Failed to create entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Entry Logged</h3>
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Your private entry has been securely saved.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Visible only to you</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-pink-500" />
                Log Intimacy Entry
              </DialogTitle>
              <DialogDescription>Private tracking - visible only to you</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 30"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              {/* Satisfaction Rating */}
              <div className="space-y-2">
                <Label>Satisfaction Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSatisfactionRating(value)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          satisfactionRating && value <= satisfactionRating
                            ? "fill-pink-500 text-pink-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {satisfactionRating && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSatisfactionRating(null)}
                      className="cursor-pointer ml-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Initiation */}
              <div className="space-y-2">
                <Label htmlFor="initiation">Who Initiated?</Label>
                <Select value={initiation} onValueChange={setInitiation}>
                  <SelectTrigger id="initiation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">You</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="mutual">Mutual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type (optional)</Label>
                <Input
                  id="type"
                  placeholder="e.g., spontaneous, planned, etc."
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Positions */}
              <div className="space-y-2">
                <Label>Positions (optional)</Label>
                <div className="border rounded-md p-3">
                  <ScrollArea className="h-[150px] pr-3">
                    <div className="space-y-2">
                      {availablePositions.map((position) => (
                        <div key={position.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`position-${position.id}`}
                            checked={positions.includes(position.name)}
                            onCheckedChange={() => handlePositionToggle(position.name)}
                          />
                          <label
                            htmlFor={`position-${position.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {position.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {positions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {positions.length} selected
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage your position list in the Manage tab
                </p>
              </div>

              {/* Mood Before/After */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moodBefore">Mood Before</Label>
                  <Select value={moodBefore} onValueChange={setMoodBefore}>
                    <SelectTrigger id="moodBefore">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="tired">Tired</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moodAfter">Mood After</Label>
                  <Select value={moodAfter} onValueChange={setMoodAfter}>
                    <SelectTrigger id="moodAfter">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="satisfied">Satisfied</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="energized">Energized</SelectItem>
                      <SelectItem value="sleepy">Sleepy</SelectItem>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Private Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Private Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Your private thoughts and reflections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
