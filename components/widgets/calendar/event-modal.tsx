"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Event, EventNotification, EventCategory } from "@/lib/db/events";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { showCreationError } from "@/lib/success-toasts";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import { cn } from "@/lib/utils";

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
  category: string;
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

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => onOpenChange(false),
  });

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

  // Update form data when event or date changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        category: event.category || "",
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
        category: "",
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        {showSuccess ? (
          <div className="bg-media-surface-container-lowest p-16 rounded-xl shadow-2xl flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-3xl font-bold text-media-primary">Event Created!</h3>
            <p className="text-media-outline text-center text-lg">
              Your chapter has been written to the calendar.
            </p>
          </div>
        ) : (
          <div className="bg-media-surface-container-lowest p-8 md:p-16 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative overflow-hidden font-lexend max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-media-secondary/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-media-primary mb-12 text-center uppercase tracking-tighter">
              {event ? "Edit Event" : "Create Event"}
            </h1>
            
            <form onSubmit={handleSave} className="space-y-16 relative z-10 max-w-2xl mx-auto">
              {/* Identity & Purpose Section */}
              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Essential Details</label>
                  <h2 className="text-3xl font-bold text-media-primary mb-6">Identity & Purpose</h2>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <input
                      className="w-full bg-media-surface-container-low border-2 border-transparent rounded-lg p-4 text-xl font-bold text-media-primary placeholder:text-media-outline/50 focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all"
                      placeholder="Event Title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      className="w-full bg-media-surface-container-low border-2 border-transparent rounded-lg p-4 text-media-on-surface placeholder:text-media-outline/50 focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all"
                      placeholder="Description of the gathering..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Logistics Section */}
              <div className="space-y-8 pt-8 border-t border-media-surface-container-high">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Space & Time</label>
                  <h2 className="text-3xl font-bold text-media-primary mb-6">Logistics</h2>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-media-on-surface-variant uppercase tracking-tighter">Location</label>
                      <div className="relative group">
                        <MaterialSymbol 
                          icon="location_on" 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-media-outline" 
                        />
                        <input
                          className="w-full bg-media-surface-container-low border-2 border-transparent rounded-lg pl-12 pr-4 py-4 text-media-on-surface focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all"
                          placeholder="Physical address or digital link"
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-media-on-surface-variant uppercase tracking-tighter">Category</label>
                      <div className="relative group">
                        <MaterialSymbol 
                          icon="category" 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-media-outline" 
                        />
                        <select
                          className="w-full bg-media-surface-container-low border-2 border-transparent rounded-lg pl-12 pr-4 py-4 text-media-on-surface focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all appearance-none cursor-pointer"
                          value={formData.category || "none"}
                          onChange={(e) => handleChange("category", e.target.value === "none" ? "" : e.target.value)}
                        >
                          <option value="none">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <MaterialSymbol 
                          icon="expand_more" 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-media-outline pointer-events-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="p-8 rounded-lg bg-media-surface-container-low/50 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MaterialSymbol icon="event_repeat" className="text-media-primary" />
                        <span className="font-bold text-media-primary">All day event</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          className="sr-only peer"
                          type="checkbox"
                          checked={formData.all_day}
                          onChange={(e) => handleChange("all_day", e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-media-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-media-secondary"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-media-on-surface-variant uppercase tracking-widest block">Start</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            className="w-full bg-media-surface-container border-2 border-transparent rounded-lg p-4 text-sm focus:ring-0 focus:border-media-secondary outline-none transition-all"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                            required
                          />
                          {!formData.all_day && (
                            <input
                              className="w-full bg-media-surface-container border-2 border-transparent rounded-lg p-4 text-sm focus:ring-0 focus:border-media-secondary outline-none transition-all"
                              type="time"
                              value={formData.start_time}
                              onChange={(e) => handleChange("start_time", e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-media-on-surface-variant uppercase tracking-widest block">End</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            className="w-full bg-media-surface-container border-2 border-transparent rounded-lg p-4 text-sm focus:ring-0 focus:border-media-secondary outline-none transition-all"
                            type="date"
                            value={formData.end_date || formData.date}
                            min={formData.date}
                            onChange={(e) => handleChange("end_date", e.target.value)}
                          />
                          {!formData.all_day && (
                            <input
                              className="w-full bg-media-surface-container border-2 border-transparent rounded-lg p-4 text-sm focus:ring-0 focus:border-media-secondary outline-none transition-all"
                              type="time"
                              value={formData.end_time}
                              onChange={(e) => handleChange("end_time", e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
                <button
                  className="w-full md:w-auto min-w-[160px] px-10 py-4 rounded-lg bg-media-surface-container-high text-media-on-surface-variant font-bold hover:bg-media-surface-dim transition-all active:scale-95 cursor-pointer"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </button>
                <button
                  className="w-full md:w-auto min-w-[200px] px-12 py-4 rounded-lg bg-media-secondary text-media-on-secondary font-bold shadow-lg shadow-media-secondary/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : event ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
