"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CopyActivityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (date: Date) => void;
}

export function CopyActivityModal({
  isOpen,
  onOpenChange,
  onCopy,
}: CopyActivityModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
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

  const footer = (
    <div className={cn(isDesktop ? "flex justify-end gap-2" : "grid gap-2")}>
        {isDesktop && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
            </Button>
        )}
      <Button onClick={handleSubmit} disabled={!date}>
        Copy Workout
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Copy Workout</DialogTitle>
            <DialogDescription>
              Choose a date to copy this workout to.
            </DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-6 h-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Copy Workout</SheetTitle>
          <SheetDescription>
            Choose a date to copy this workout to.
          </SheetDescription>
        </SheetHeader>
        {content}
        <SheetFooter className="mt-4">{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
