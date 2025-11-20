"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Event, EventNotification } from "@/lib/db/events";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { showCreationError } from "@/lib/success-toasts";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // YYYY-MM-DD format
  event?: Event; // Optional - for editing existing events
  onSave: (eventData: EventFormData) => Promise<void>;
}

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  end_date: string;
  notifications: EventNotification[];
}

export function EventModal({
  open,
  onOpenChange,
  date,
  event,
  onSave,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    date: date,
    start_time: "",
    end_time: "",
    all_day: false,
    end_date: "",
    notifications: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => onOpenChange(false),
  });

  // Update form data when event or date changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        date: event.date,
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        all_day: event.all_day,
        end_date: event.end_date || "",
        notifications: event.notifications || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        date: date,
        start_time: "",
        end_time: "",
        all_day: false,
        end_date: "",
        notifications: [],
      });
    }
  }, [event, date]);

  // Reset success state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetSuccess();
    }
  }, [open, resetSuccess]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a title for the event");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      // Show success animation for create, close immediately for edit
      if (event) {
        onOpenChange(false);
      } else {
        triggerSuccess();
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      showCreationError("event", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Event Created!</h3>
            <p className="text-muted-foreground text-center">
              Your event has been added to the calendar
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {event ? "Update the event details below" : "Add a new event to your calendar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location (optional)"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all_day"
              checked={formData.all_day}
              onCheckedChange={(checked) => handleChange("all_day", checked)}
            />
            <Label htmlFor="all_day" className="cursor-pointer">
              All day event
            </Label>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (for multi-day events)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                min={formData.date}
              />
            </div>
          </div>

          {/* Time Row - Only show if not all day */}
          {!formData.all_day && (
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : event ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
