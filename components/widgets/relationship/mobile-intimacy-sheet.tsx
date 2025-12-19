"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, Lock } from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-pink-500" />
              <SheetTitle>Add Intimate Entry</SheetTitle>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-muted-foreground">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="h-11 border-2 focus-visible:ring-brand"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-muted-foreground">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 border-2 focus-visible:ring-brand"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-muted-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-11 border-2"
                />
              </div>

              {/* Satisfaction Rating */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Satisfaction</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSatisfactionRating(value)}
                      className="cursor-pointer transition-transform hover:scale-110"
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
                      className="cursor-pointer ml-1 h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Initiation and Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="initiation" className="text-muted-foreground">
                    Initiated By
                  </Label>
                  <Select value={initiation} onValueChange={setInitiation}>
                    <SelectTrigger id="initiation" className="h-11 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="mutual">Mutual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-muted-foreground">
                    Location
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className="h-11 border-2">
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
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-muted-foreground">
                  Private Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any private thoughts or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isSaving || !date}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
