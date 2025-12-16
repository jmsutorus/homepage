"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import type { RelationshipMilestone } from "@/lib/db/relationship";
import { toast } from "sonner";

interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: RelationshipMilestone;
  onMilestoneUpdated: () => void;
}

export function EditMilestoneDialog({ open, onOpenChange, milestone: initialMilestone, onMilestoneUpdated }: EditMilestoneDialogProps) {
  const [title, setTitle] = useState(initialMilestone.title);
  const [date, setDate] = useState(initialMilestone.date);
  const [category, setCategory] = useState(initialMilestone.category);
  const [description, setDescription] = useState(initialMilestone.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update form when milestone changes
  useEffect(() => {
    setTitle(initialMilestone.title);
    setDate(initialMilestone.date);
    setCategory(initialMilestone.category);
    setDescription(initialMilestone.description || "");
  }, [initialMilestone]);

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
      const response = await fetch(`/api/relationship/milestones/${initialMilestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          category,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update milestone");
      }

      toast.success("Milestone updated successfully");
      onOpenChange(false);
      onMilestoneUpdated();
    } catch (error) {
      console.error("Failed to update milestone:", error);
      toast.error("Failed to update milestone. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-pink-500" />
            Edit Milestone
          </DialogTitle>
          <DialogDescription>Update this special moment in your relationship</DialogDescription>
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
            {isSaving ? "Saving..." : "Update Milestone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
