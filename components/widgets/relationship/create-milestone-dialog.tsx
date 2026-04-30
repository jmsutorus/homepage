"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput, EditorialTextarea } from "@/components/ui/editorial-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { TreeSuccess } from "@/components/ui/animations/tree-success";

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
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Milestone"
      description="Record a significant chapter in your shared history and preserve it forever."
      onSubmit={showSuccess ? undefined : handleSave}
      submitText="Save Milestone"
      isLoading={isSaving}
      maxWidth="sm:max-w-4xl"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <TreeSuccess size={160} showText={false} />
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-media-primary tracking-tighter uppercase font-lexend">Milestone Preserved</h3>
            <p className="text-media-on-surface-variant font-medium">
              This special moment has been recorded in your history.
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </ResponsiveDialog>
  );
}
