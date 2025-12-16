"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Star } from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Add Milestone</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-muted-foreground">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. First Anniversary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 border-2 focus-visible:ring-brand"
                  required
                  autoFocus
                />
              </div>

              {/* Date and Category */}
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
                  <Label htmlFor="category" className="text-muted-foreground">
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="h-11 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell the story of this special moment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isSaving || !title || !date || !category}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Save Milestone
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
