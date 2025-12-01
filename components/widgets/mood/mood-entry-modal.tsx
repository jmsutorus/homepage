"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDateLongSafe } from "@/lib/utils";
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from "lucide-react";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

interface MoodEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  initialRating?: number;
  initialNote?: string;
  onSave: (rating: number, note: string) => Promise<void>;
}

const moodOptions = [
  { value: 1, label: "Terrible", icon: TrendingDown, color: "text-red-500 hover:bg-red-500/10" },
  { value: 2, label: "Bad", icon: Frown, color: "text-orange-500 hover:bg-orange-500/10" },
  { value: 3, label: "Okay", icon: Meh, color: "text-yellow-500 hover:bg-yellow-500/10" },
  { value: 4, label: "Good", icon: Smile, color: "text-lime-500 hover:bg-lime-500/10" },
  { value: 5, label: "Great", icon: TrendingUp, color: "text-green-500 hover:bg-green-500/10" },
];

export function MoodEntryModal({
  open,
  onOpenChange,
  date,
  initialRating = 3,
  initialNote = "",
  onSave,
}: MoodEntryModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => onOpenChange(false),
  });

  // Update state when props change (when a different date is selected)
   
  useEffect(() => {
    // eslint-disable-next-line
    setRating(initialRating);
     
    setNote(initialNote);
  }, [initialRating, initialNote, date]);

  // Reset success state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetSuccess();
    }
  }, [open, resetSuccess]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(rating, note);
      triggerSuccess();
    } catch (error) {
      console.error("Failed to save mood entry:", error);
      setIsSaving(false);
    }
  };

  const formattedDate = formatDateLongSafe(date, "en-US");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Mood Tracked!</h3>
            <p className="text-muted-foreground text-center">
              Thanks for checking in with yourself.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>How are you feeling?</DialogTitle>
              <DialogDescription>{formattedDate}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
          {/* Mood Rating Selector */}
          <div className="space-y-3">
            <Label>Mood Rating</Label>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    rating === value
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-border hover:border-primary/50"
                  } ${color}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Textarea
              id="note"
              placeholder="How was your day? Any thoughts or highlights..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button className="cursor-pointer" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
