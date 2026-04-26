"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { motion, PanInfo } from "framer-motion";

interface MobileMilestoneSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMilestoneAdded: () => void;
}

export function MobileMilestoneSheet({ open, onOpenChange, onMilestoneAdded }: MobileMilestoneSheetProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("special");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTitle("");
        setDate("");
        setCategory("special");
        setDescription("");
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !category) {
      return;
    }

    if (title.length < 3) {
      showCreationError("milestone", new Error("Title must be at least 3 characters"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/relationship/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          category,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create milestone");
      }

      // Reset form
      setTitle("");
      setDate("");
      setCategory("special");
      setDescription("");

      showCreationSuccess("milestone");
      onMilestoneAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create milestone:", error);
      showCreationError("milestone", error);
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
            <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">Record Epoch</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div 
              className="flex-1 overflow-y-auto px-6 py-8 space-y-8"
              onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
            >
              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Epoch Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. First Anniversary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
                  required
                  autoFocus
                />
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-2 gap-3">
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
                  <Label htmlFor="category" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Classification
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container border-media-outline-variant">
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="first">First Time</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="special">Special Moment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Narrative Context
                </Label>
                <Textarea
                  id="description"
                  placeholder="Record the shared experience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="resize-none text-base border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-medium placeholder:text-media-on-surface-variant/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-media-outline-variant/10 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <Button
                type="submit"
                disabled={isSaving || !title || !date || !category}
                className="w-full h-16 text-sm bg-media-primary hover:bg-media-primary/90 text-media-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                {isSaving ? (
                  "Synchronizing..."
                ) : (
                  <>
                    Save Milestone
                  </>
                )}
              </Button>
            </div>
          </form>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
