"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar as CalendarIcon } from "lucide-react";
import type { EventFormData } from "./event-modal";
import type { EventCategory } from "@/lib/db/events";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

interface MobileEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // YYYY-MM-DD format
  onSave: (eventData: EventFormData) => Promise<void>;
}

export function MobileEventSheet({
  open,
  onOpenChange,
  date,
  onSave,
}: MobileEventSheetProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    category: "",
    date: date,
    start_time: "",
    end_time: "",
    all_day: false,
    end_date: "",
    notifications: [],
  });
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/event-categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch event categories:", error);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Update form data when date changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
  }, [date]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      // Delay reset to avoid visual flicker
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          location: "",
          category: "",
          date: date,
          start_time: "",
          end_time: "",
          all_day: false,
          end_date: "",
          notifications: [],
        });
      }, 300);
    }
  }, [open, date]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      // Reset form immediately
      setFormData({
        title: "",
        description: "",
        location: "",
        category: "",
        date: date,
        start_time: "",
        end_time: "",
        all_day: false,
        end_date: "",
        notifications: [],
      });
      showCreationSuccess("event");
      onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Add Event</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                  disabled={isSaving}
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                  autoFocus
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
                  disabled={isSaving}
                  rows={3}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
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
                  disabled={isSaving}
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || "none"}
                  onValueChange={(value) => handleChange("category", value === "none" ? "" : value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="category" className="text-base h-12 border-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* All Day Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all_day"
                  checked={formData.all_day}
                  onCheckedChange={(checked) => handleChange("all_day", checked)}
                  disabled={isSaving}
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
                    disabled={isSaving}
                    className="text-base h-12 border-2 focus-visible:ring-brand"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    min={formData.date}
                    disabled={isSaving}
                    className="text-base h-12 border-2 focus-visible:ring-brand"
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
                      disabled={isSaving}
                      className="text-base h-12 border-2 focus-visible:ring-brand"
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
                      disabled={isSaving}
                      className="text-base h-12 border-2 focus-visible:ring-brand"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isSaving || !formData.title.trim()}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isSaving ? (
                  "Adding..."
                ) : (
                  <>
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Add Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
