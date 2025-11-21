"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
}

export function RescheduleDialog({ open, onOpenChange, onConfirm }: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleConfirm = () => {
    if (date) {
      onConfirm(date);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Task</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            Reschedule to {date ? format(date, "MMM d") : "..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
