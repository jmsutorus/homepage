"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Send, MapPin, DollarSign, ImageIcon, Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

interface MobileDateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateAdded: () => void;
}

export function MobileDateSheet({ open, onOpenChange, onDateAdded }: MobileDateSheetProps) {
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
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
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !type) {
      return;
    }

    setIsSaving(true);
    try {
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
          console.error("Photo upload failed");
        }
      }

      // Reset form
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

      showCreationSuccess("date");
      onDateAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create date:", error);
      showCreationError("date", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Log a Date Night</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-muted-foreground">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="h-11 border-2 focus-visible:ring-brand"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-muted-foreground">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 border-2 focus-visible:ring-brand"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-muted-foreground">
                  Type *
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="h-11 border-2">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-muted-foreground">
                    Venue
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="venue"
                      placeholder="Restaurant..."
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="pl-9 h-11 border-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-muted-foreground">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 border-2"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="cursor-pointer transition-transform hover:scale-110"
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
                      className="cursor-pointer ml-1 h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-muted-foreground">
                  Cost (Optional)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="pl-9 h-11 border-2"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-muted-foreground">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="What made this date special? Any highlights or memories..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Date Photo (Optional)</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 h-11 border-2">
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
                      className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/10 transition-all group relative overflow-hidden"
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
                          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setPreviewUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} 
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
                        className="pl-9 h-11 border-2"
                      />
                    </div>
                    {photoUrl && (
                      <div className="rounded-xl overflow-hidden border-2 shadow-sm aspect-video">
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

            {/* Submit Button */}
            <div className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isSaving || !date || !type}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Save Date
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
