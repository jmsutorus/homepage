"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, DollarSign, ImageIcon, Upload, X, Link as LinkIcon } from "lucide-react";
import { showCreationError } from "@/lib/success-toasts";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { HapticButton } from "@/components/ui/haptic-button";
import { useHaptic } from "@/hooks/use-haptic";
import { motion, PanInfo } from "framer-motion";

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
  const { trigger } = useHaptic();

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onDateAdded();
    },
  });

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

      triggerSuccess();
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
        className="h-[90dvh] max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className="flex flex-col h-full font-lexend bg-media-surface-container-lowest"
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
            <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">Record Milestone</SheetTitle>
          </SheetHeader>

          {showSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
              <div className="relative">
                <TreeSuccess size={160} showText={false} />
                <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Milestone Recorded</h3>
                <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
                  Memory archived. Geographic and atmospheric parameters synchronized.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Protocol Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="time" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Timestamp
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-3">
                <Label htmlFor="type" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Classification
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
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

              {/* Venue and Location Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="venue" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Venue
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-media-on-surface-variant/40" />
                    <Input
                      id="venue"
                      placeholder="e.g. Catch Steak"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Locale
                  </Label>
                  <Input
                    id="location"
                    placeholder="City..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Atmospheric Grade
                </Label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        trigger("light");
                        setRating(value);
                      }}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          rating && value <= rating
                            ? "fill-media-secondary text-media-secondary"
                            : "text-media-outline-variant/30"
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
                      className="cursor-pointer ml-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest text-media-on-surface-variant hover:text-media-secondary transition-colors"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-3">
                <Label htmlFor="cost" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Allocated Capital
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-media-on-surface-variant/40" />
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="pl-12 h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Narrative Context
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Record the shared experience..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none text-base border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-medium placeholder:text-media-on-surface-variant/20"
                />
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">Visual Documentation</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-media-surface-container-low p-1.5 h-14 border-2 border-transparent rounded-2xl">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-media-surface-container data-[state=active]:shadow-sm rounded-xl transition-all h-full font-bold">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="data-[state=active]:bg-media-surface-container data-[state=active]:shadow-sm rounded-xl transition-all h-full font-bold">
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
                            className="cursor-pointer absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
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

                  <TabsContent value="url" className="mt-6 space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-media-on-surface-variant/40" />
                      <Input
                        id="photoUrl"
                        placeholder="https://example.com/image.jpg"
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="pl-12 h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
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
            <div className="border-t border-media-outline-variant/10 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <HapticButton
                type="submit"
                hapticPattern="success"
                disabled={isSaving || !date || !type}
                className="w-full h-16 text-sm bg-media-primary hover:bg-media-primary/90 text-media-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center"
              >
                {isSaving ? (
                  "Synchronizing..."
                ) : (
                  <>
                    Save Date
                  </>
                )}
              </HapticButton>
            </div>
          </form>
          )}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
