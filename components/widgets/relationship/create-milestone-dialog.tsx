"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMilestoneAdded: () => void;
}

export function CreateMilestoneDialog({ open, onOpenChange, onMilestoneAdded }: CreateMilestoneDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("special");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onMilestoneAdded();
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetSuccess();
      setTimeout(() => {
        setTitle("");
        setDate("");
        setCategory("special");
        setDescription("");
      }, 200);
    }
  }, [open, resetSuccess]);

  const handleSave = async () => {
    if (!title || !date || !category) {
      alert("Please fill in the required fields (title, date, and category)");
      return;
    }

    if (title.length < 3) {
      alert("Title must be at least 3 characters");
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

      // Reset form before showing success
      setTitle("");
      setDate("");
      setCategory("special");
      setDescription("");

      triggerSuccess();
    } catch (error) {
      console.error("Failed to create milestone:", error);
      alert("Failed to create milestone. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Milestone Created!</h3>
            <p className="text-muted-foreground text-center">
              This special moment has been preserved forever
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Milestone</DialogTitle>
              <DialogDescription>Record a special moment in your relationship</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., First Date, Our Anniversary, etc."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Date and Category */}
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
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell the story of this special moment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
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
                {isSaving ? "Saving..." : "Save Milestone"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
