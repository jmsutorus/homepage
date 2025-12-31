"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ImageIcon } from "lucide-react";
import type { RelationshipDate } from "@/lib/db/relationship";
import { showCreationSuccess } from "@/lib/success-toasts";
import { toast } from "sonner";

interface EditDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: RelationshipDate;
  onDateUpdated: () => void;
}

export function EditDateDialog({ open, onOpenChange, date: initialDate, onDateUpdated }: EditDateDialogProps) {
  const [date, setDate] = useState(initialDate.date);
  const [time, setTime] = useState(initialDate.time || "");
  const [type, setType] = useState(initialDate.type);
  const [location, setLocation] = useState(initialDate.location || "");
  const [venue, setVenue] = useState(initialDate.venue || "");
  const [rating, setRating] = useState<number | null>(initialDate.rating);
  const [cost, setCost] = useState(initialDate.cost?.toString() || "");
  const [notes, setNotes] = useState(initialDate.notes || "");
  const [photoUrl, setPhotoUrl] = useState(initialDate.photos || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update form when date changes
  useEffect(() => {
    setDate(initialDate.date);
    setTime(initialDate.time || "");
    setType(initialDate.type);
    setLocation(initialDate.location || "");
    setVenue(initialDate.venue || "");
    setRating(initialDate.rating);
    setCost(initialDate.cost?.toString() || "");
    setNotes(initialDate.notes || "");
    setPhotoUrl(initialDate.photos || "");
  }, [initialDate]);

  const handleSave = async () => {
    if (!date || !type) {
      alert("Please fill in the required fields (date and type)");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/relationship/dates/${initialDate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: time || undefined,
          type,
          location: location || undefined,
          venue: venue || undefined,
          rating: rating || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          notes: notes || undefined,
          photos: photoUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update date");
      }

      showCreationSuccess("date");
      onOpenChange(false);
      onDateUpdated();
    } catch (error) {
      console.error("Failed to update date:", error);
      toast.error("Failed to update date. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Date Night</DialogTitle>
          <DialogDescription>Update the details of this date</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="movie">Movie</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="outing">Outing</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="Restaurant, theater, etc."
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City or neighborhood"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      rating && value <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRating(null)}
                  className="cursor-pointer ml-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What made this date special? Any highlights or memories..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photoUrl">Photo URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="photoUrl"
                placeholder="https://example.com/image.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">Optional: Add a photo URL to display on the date card</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Update Date"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
