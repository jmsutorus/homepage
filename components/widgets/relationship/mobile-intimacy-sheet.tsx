"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Lock } from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { HapticButton } from "@/components/ui/haptic-button";
import { useHaptic } from "@/hooks/use-haptic";
import { motion, PanInfo } from "framer-motion";

interface MobileIntimacySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryAdded: () => void;
}

export function MobileIntimacySheet({ open, onOpenChange, onEntryAdded }: MobileIntimacySheetProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(3);
  const [initiation, setInitiation] = useState("mutual");
  const [location, setLocation] = useState("home");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { trigger } = useHaptic();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDate("");
        setTime("");
        setDuration("");
        setSatisfactionRating(3);
        setInitiation("mutual");
        setLocation("home");
        setNotes("");
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
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
          location,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create entry");
      }

      // Reset form
      setDate("");
      setTime("");
      setDuration("");
      setSatisfactionRating(3);
      setInitiation("mutual");
      setLocation("home");
      setNotes("");

      showCreationSuccess("intimacy");
      onEntryAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create entry:", error);
      showCreationError("intimacy", error);
    } finally {
      setIsSaving(false);
    }
  };

  const [isAtTop, setIsAtTop] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90dvh] max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className="flex flex-col h-full font-lexend bg-media-surface-container-lowest"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-media-secondary" />
              <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">Add Intimate Entry</SheetTitle>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div 
              className="flex-1 overflow-y-auto px-6 py-8 space-y-8"
              onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
            >
              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Protocol Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="time" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Timestamp
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label htmlFor="duration" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Temporal Span (Minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g. 30"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
                />
              </div>

              {/* Satisfaction Rating */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Satisfaction Grade
                </Label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        trigger("light");
                        setSatisfactionRating(value);
                      }}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          satisfactionRating && value <= satisfactionRating
                            ? "fill-media-secondary text-media-secondary"
                            : "text-media-outline-variant/30"
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
                      className="cursor-pointer ml-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest text-media-on-surface-variant hover:text-media-secondary transition-colors"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Initiation and Location Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="initiation" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Catalyst
                  </Label>
                  <Select value={initiation} onValueChange={setInitiation}>
                    <SelectTrigger id="initiation" className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container border-media-outline-variant">
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="mutual">Mutual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Locale
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
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

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Narrative Context
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Record the shared experience..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none text-base border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-medium placeholder:text-media-on-surface-variant/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-media-outline-variant/10 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <HapticButton
                type="submit"
                hapticPattern="success"
                disabled={isSaving || !date}
                className="w-full h-16 text-sm bg-media-primary hover:bg-media-primary/90 text-media-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center"
              >
                {isSaving ? (
                  "Synchronizing..."
                ) : (
                  <>
                    Save Moment
                  </>
                )}
              </HapticButton>
            </div>
          </form>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
