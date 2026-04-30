"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput, EditorialTextarea } from "@/components/ui/editorial-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Lock, Star } from "lucide-react";
import type { RelationshipPosition } from "@/lib/db/relationship";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { TreeSuccess } from "@/components/ui/animations/tree-success";

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
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Secure Moment"
      description="Private tracking - encrypted and visible only to you."
      onSubmit={showSuccess ? undefined : handleSave}
      submitText="Save Moment"
      isLoading={isSaving}
      maxWidth="sm:max-w-4xl"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <TreeSuccess size={160} showText={false} />
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-media-primary tracking-tighter uppercase font-lexend">Moment Logged</h3>
            <div className="flex items-center justify-center gap-2 text-media-on-surface-variant font-medium">
              <Lock className="h-4 w-4" />
              <span>Visible only to you</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Logistics */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Logistics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <EditorialInput
                label="Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                sizeVariant="lg"
              />
              <EditorialInput
                label="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                sizeVariant="lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <EditorialInput
                label="Duration (minutes)"
                type="number"
                placeholder="e.g., 30"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                sizeVariant="lg"
              />
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
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
            </div>
          </div>

          {/* Section 2: Experience */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Experience</h3>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Satisfaction Rating</label>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSatisfactionRating(value)}
                      className="cursor-pointer group"
                    >
                      <Star
                        className={`h-10 w-10 transition-all ${
                          satisfactionRating && value <= satisfactionRating
                            ? "fill-pink-500 text-pink-500 scale-110"
                            : "text-media-on-surface-variant/20 group-hover:text-media-on-surface-variant/40"
                        }`}
                        fill={satisfactionRating && value <= satisfactionRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                {satisfactionRating && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSatisfactionRating(null)}
                    className="cursor-pointer text-xs font-bold uppercase tracking-widest text-media-on-surface-variant hover:text-media-primary"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Who Initiated?</label>
                <Select value={initiation} onValueChange={setInitiation}>
                  <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
                    <SelectItem value="me">You</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="mutual">Mutual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EditorialInput
                label="Type (optional)"
                placeholder="e.g., spontaneous, planned, etc."
                value={type}
                onChange={(e) => setType(e.target.value)}
                sizeVariant="lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Mood Before</label>
                <Select value={moodBefore} onValueChange={setMoodBefore}>
                  <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                    <SelectItem value="stressed">Stressed</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Mood After</label>
                <Select value={moodAfter} onValueChange={setMoodAfter}>
                  <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
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
          </div>

          {/* Section 3: Technical Details */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Technical Details</h3>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Positions (optional)</label>
              <div className="bg-media-surface-container-low border border-media-outline-variant/10 rounded-2xl p-6">
                <ScrollArea className="h-[200px] pr-4 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    {availablePositions.map((position) => (
                      <div key={position.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-media-surface-container-high transition-colors group cursor-pointer" onClick={() => handlePositionToggle(position.name)}>
                        <Checkbox
                          id={`position-${position.id}`}
                          checked={positions.includes(position.name)}
                          onCheckedChange={() => handlePositionToggle(position.name)}
                          className="border-2 border-media-outline-variant/30 data-[state=checked]:bg-media-secondary data-[state=checked]:border-media-secondary"
                        />
                        <label
                          htmlFor={`position-${position.id}`}
                          className="text-sm font-bold text-media-primary group-hover:text-media-secondary transition-colors cursor-pointer"
                        >
                          {position.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {positions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-media-outline-variant/10 flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-widest font-black text-media-secondary">
                      {positions.length} selected
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setPositions([])} className="text-[10px] uppercase tracking-widest font-bold">Clear All</Button>
                  </div>
                )}
              </div>
            </div>

            <EditorialTextarea
              label="Private Notes"
              placeholder="Your private thoughts and reflections..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              sizeVariant="lg"
            />
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
