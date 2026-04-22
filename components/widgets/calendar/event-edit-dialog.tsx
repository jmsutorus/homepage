"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Event, EventCategory } from "@/lib/db/events";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import { cn } from "@/lib/utils";

interface EventEditDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: () => void;
}

export function EventEditDialog({
  event,
  open,
  onOpenChange,
  onEventUpdated,
}: EventEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    location: event.location || "",
    category: event.category || "",
    date: event.date,
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    all_day: event.all_day,
    end_date: event.end_date || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          location: formData.location || null,
          category: formData.category || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          end_date: formData.end_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-media-surface-container-lowest p-8 md:p-16 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative overflow-hidden font-lexend max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-media-secondary/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-media-primary mb-12 text-center uppercase tracking-tighter">
            Edit Event
          </h1>
          
          {/* Top Header Actions */}
          <div className="absolute top-8 right-8 z-20 flex items-center gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="cursor-pointer p-3 rounded-full bg-media-error-container/10 text-media-error hover:bg-media-error-container/20 transition-all active:scale-95 disabled:opacity-50"
              title="Delete Event"
            >
              <MaterialSymbol icon="delete" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16 relative z-10 max-w-2xl mx-auto">
            {/* Identity & Purpose Section */}
            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Refine Details</label>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
