"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ImageIcon, Upload, Link as LinkIcon, Loader2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

interface CreateDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateAdded: () => void;
}

export function CreateDateDialog({ open, onOpenChange, onDateAdded }: CreateDateDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("dinner");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onDateAdded();
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetSuccess();
      // Reset form after a delay to avoid flash
      setTimeout(() => {
        setDate("");
        setTime("");
        setType("dinner");
        setLocation("");
        setVenue("");
        setRating(null);
        setCost("");
        setNotes("");
        setPhotoUrl("");
        setSelectedFile(null);
        setPreviewUrl(null);
      }, 200);
    }
  }, [open, resetSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!date || !type) {
      alert("Please fill in the required fields (date and type)");
      return;
    }

    setIsSaving(true);
    try {
      // Create the date first to get an ID if we need to upload a photo
      const response = await fetch("/api/relationship/dates", {
        method: "POST",
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
          photos: selectedFile ? undefined : (photoUrl.trim() || undefined),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create date");
      }

      const newDate = await response.json();

      // If there's a file to upload, do it now
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch(`/api/relationship/dates/${newDate.id}/photo`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          toast.error("Date created but photo upload failed");
        }
      }

      // Reset form before showing success
      setDate("");
      setTime("");
      setType("dinner");
      setLocation("");
      setVenue("");
      setRating(null);
      setCost("");
      setNotes("");
      setPhotoUrl("");
      setSelectedFile(null);
      setPreviewUrl(null);

      triggerSuccess();
    } catch (error) {
      console.error("Failed to create date:", error);
      toast.error("Failed to create date. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Date Night Logged!</h3>
            <p className="text-muted-foreground text-center">
              Keep making beautiful memories together
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Log a Date Night</DialogTitle>
              <DialogDescription>Record a special moment together</DialogDescription>
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

              {/* Photos */}
              <div className="space-y-3">
                <Label>Date Photo</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-11">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-9">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-4 space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-all group relative overflow-hidden"
                    >
                      {previewUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm font-medium">Change Photo</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">Click to upload photo</p>
                            <p className="text-xs text-muted-foreground mt-1">Capture the moment together</p>
                          </div>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="mt-4 space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="photoUrl"
                        placeholder="https://example.com/image.jpg"
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="pl-9 h-11 rounded-xl"
                      />
                    </div>
                    {photoUrl && (
                      <div className="rounded-xl overflow-hidden border border-muted shadow-sm aspect-video">
                        <img 
                          src={photoUrl} 
                          alt="URL Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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
                {isSaving ? "Saving..." : "Save Date"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
