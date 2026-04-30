"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CopyActivityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (date: Date) => void;
}

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

export function CopyActivityModal({
  isOpen,
  onOpenChange,
  onCopy,
}: CopyActivityModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = () => {
    if (date) {
      onCopy(date);
      onOpenChange(false);
    }
  };

  const content = (
    <div className="grid gap-4 py-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Select Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Copy Workout"
      description="Choose a date to copy this workout to."
      onSubmit={handleSubmit}
      submitText="Copy Workout"
    >
      {content}
    </ResponsiveDialog>
  );
}
