"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="distance">Distance (miles)</Label>
            <Input
            id="distance"
            type="number"
            min="0"
            step="0.01"
            placeholder="1.0"
            value={split.distance || ""}
            onChange={(e) => updateField("distance", parseFloat(e.target.value))}
            autoFocus
            required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time (MM:SS)</Label>
            <Input
              id="time"
              type="text"
              placeholder="08:30"
              value={split.time}
              onChange={(e) => updateField("time", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="elevation">Elevation Gain (ft)</Label>
            <Input
              id="elevation"
              type="number"
              placeholder="0"
              value={split.elevation}
              onChange={(e) => updateField("elevation", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className={cn(isDesktop ? "flex justify-end gap-2" : "grid gap-2")}>
        {isDesktop && (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
            </Button>
        )}
        <Button type="submit">
          {editSplit ? "Update Split" : "Add Split"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editSplit ? "Edit Split" : "Add Split"}</DialogTitle>
             <DialogDescription>
                {editSplit ? "Update details for this split." : "Record a new split."}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-6 h-auto max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>{editSplit ? "Edit Split" : "Add Split"}</SheetTitle>
           <SheetDescription>
                {editSplit ? "Update details" : "Add new split"}
            </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
