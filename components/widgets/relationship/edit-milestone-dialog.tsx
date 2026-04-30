"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput, EditorialTextarea } from "@/components/ui/editorial-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { RelationshipMilestone } from "@/lib/db/relationship";

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
      toast.error("Please fill in the required fields (title, date, and category)");
      return;
    }

    if (title.length < 3) {
      toast.error("Title must be at least 3 characters");
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
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refine Milestone"
      description="Update the narrative of this significant chapter in your shared history."
      onSubmit={handleSave}
      submitText="Update Milestone"
      isLoading={isSaving}
      maxWidth="sm:max-w-4xl"
    >
      <div className="space-y-12">
        {/* Section 1: Identity */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
            <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">The Identity</h3>
          </div>

          <EditorialInput
            label="Title *"
            placeholder="e.g., First Date, Our Anniversary, etc."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sizeVariant="xl"
          />
        </div>

        {/* Section 2: Logistics */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
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
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
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
        </div>

        {/* Section 3: Narrative */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
            <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">The Narrative</h3>
          </div>

          <EditorialTextarea
            label="Description"
            placeholder="Tell the story of this special moment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            sizeVariant="lg"
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
