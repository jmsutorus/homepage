"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput } from "@/components/ui/editorial-input";

export interface Split {
  distance: number;
  time: string; // "MM:SS" or "HH:MM:SS"
  elevation: number;
}

interface SplitFormModalProps {
  editSplit?: Split | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (split: Split) => void;
}

export function SplitFormModal({ editSplit, isOpen, onOpenChange, onSave }: SplitFormModalProps) {
  const [split, setSplit] = useState<Split>({
    distance: 1.0,
    time: "08:00",
    elevation: 0,
  });

  useEffect(() => {
    if (isOpen) {
        if (editSplit) {
            setSplit(editSplit);
        } else {
            setSplit({
                distance: 1.0,
                time: "08:00",
                elevation: 0,
            });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(split);
    onOpenChange(false);
  };

  const updateField = (field: keyof Split, value: any) => {
    setSplit((prev) => ({ ...prev, [field]: value }));
  };

  const formContent = (
    <div className="space-y-6">
      <div className="space-y-8">
        <EditorialInput
          id="distance"
          label="Distance (miles)"
          type="number"
          min="0"
          step="0.01"
          placeholder="1.0"
          value={split.distance || ""}
          onChange={(e) => updateField("distance", parseFloat(e.target.value))}
          autoFocus
          required
          sizeVariant="lg"
        />

        <div className="grid grid-cols-2 gap-8">
          <EditorialInput
            id="time"
            label="Time (MM:SS)"
            type="text"
            placeholder="08:30"
            value={split.time}
            onChange={(e) => updateField("time", e.target.value)}
            required
            sizeVariant="lg"
          />
          <EditorialInput
            id="elevation"
            label="Elevation Gain (ft)"
            type="number"
            placeholder="0"
            value={split.elevation}
            onChange={(e) => updateField("elevation", parseInt(e.target.value) || 0)}
            sizeVariant="lg"
          />
        </div>
      </div>
      <button type="submit" className="cursor-pointer hidden" id="submit-split-button" />
    </div>
  );

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={editSplit ? "Edit Split" : "Add Split"}
      description={editSplit ? "Update details for this split." : "Record a new split."}
      onSubmit={() => document.getElementById("submit-split-button")?.click()}
      submitText={editSplit ? "Update Split" : "Add Split"}
    >
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </ResponsiveDialog>
  );
}
