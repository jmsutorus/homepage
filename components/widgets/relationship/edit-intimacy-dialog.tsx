"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock } from "lucide-react";
import type { IntimacyEntry, RelationshipPosition } from "@/lib/db/relationship";
import { toast } from "sonner";

interface EditIntimacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: IntimacyEntry;
  onEntryUpdated: () => void;
}

export function EditIntimacyDialog({ open, onOpenChange, entry: initialEntry, onEntryUpdated }: EditIntimacyDialogProps) {
  const [date, setDate] = useState(initialEntry.date);
  const [time, setTime] = useState(initialEntry.time || "");
  const [duration, setDuration] = useState(initialEntry.duration?.toString() || "");
  const [satisfactionRating, setSatisfactionRating] = useState([initialEntry.satisfaction_rating || 3]);
  const [initiation, setInitiation] = useState(initialEntry.initiation || "mutual");
  const [type, setType] = useState(initialEntry.type || "");
  const [location, setLocation] = useState(initialEntry.location || "home");
  const [moodBefore, setMoodBefore] = useState(initialEntry.mood_before || "");
  const [moodAfter, setMoodAfter] = useState(initialEntry.mood_after || "");
  const [positions, setPositions] = useState<string[]>(
    initialEntry.positions ? JSON.parse(initialEntry.positions) : []
  );
  const [availablePositions, setAvailablePositions] = useState<RelationshipPosition[]>([]);
  const [notes, setNotes] = useState(initialEntry.notes || "");
  const [isSaving, setIsSaving] = useState(false);

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

  // Update form when entry changes
  useEffect(() => {
    setDate(initialEntry.date);
    setTime(initialEntry.time || "");
    setDuration(initialEntry.duration?.toString() || "");
    setSatisfactionRating([initialEntry.satisfaction_rating || 3]);
    setInitiation(initialEntry.initiation || "mutual");
    setType(initialEntry.type || "");
    setLocation(initialEntry.location || "home");
    setMoodBefore(initialEntry.mood_before || "");
    setMoodAfter(initialEntry.mood_after || "");
    setPositions(initialEntry.positions ? JSON.parse(initialEntry.positions) : []);
    setNotes(initialEntry.notes || "");
  }, [initialEntry]);

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
      const response = await fetch(`/api/relationship/intimacy/${initialEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: time || undefined,
          duration: duration ? parseInt(duration) : undefined,
          satisfaction_rating: satisfactionRating[0],
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
        throw new Error("Failed to update intimacy entry");
      }

      toast.success("Entry updated successfully");
      onOpenChange(false);
      onEntryUpdated();
    } catch (error) {
      console.error("Failed to update intimacy entry:", error);
      toast.error("Failed to update entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-pink-500" />
            Edit Intimacy Entry
          </DialogTitle>
          <DialogDescription>Update your private entry</DialogDescription>
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
            <Label>Satisfaction Rating: {satisfactionRating[0]}/5</Label>
            <Slider
              value={satisfactionRating}
              onValueChange={setSatisfactionRating}
              min={1}
              max={5}
              step={1}
              className="py-4"
            />
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
                <SelectItem value="shower">Shower</SelectItem>
                <SelectItem value="bed">Bed</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="bath">Bath</SelectItem>
                <SelectItem value="pool">Pool</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
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
            {isSaving ? "Saving..." : "Update Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
