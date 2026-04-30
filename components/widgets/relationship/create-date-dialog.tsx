"use client";

import { useState, useEffect, useRef } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput, EditorialTextarea } from "@/components/ui/editorial-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, ImageIcon, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { TreeSuccess } from "@/components/ui/animations/tree-success";

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
      toast.error("Please fill in the required fields (date and type)");
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

  const isNoPreviewFormat = selectedFile && 
    (selectedFile.name.toLowerCase().endsWith(".heic") || 
     selectedFile.name.toLowerCase().endsWith(".dng"));

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Log Date Night"
      description="Record a special moment together and keep making beautiful memories."
      onSubmit={showSuccess ? undefined : handleSave}
      submitText="Save Date"
      isLoading={isSaving}
      maxWidth="sm:max-w-4xl"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <TreeSuccess size={160} showText={false} />
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-media-primary tracking-tighter uppercase font-lexend">Date Night Logged!</h3>
            <p className="text-media-on-surface-variant font-medium">
              Keep making beautiful memories together
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: The Essence */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">The Essence</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <EditorialInput
                label="Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                sizeVariant="lg"
              />
              <EditorialInput
                label="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                sizeVariant="lg"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Type *</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
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
          </div>

          {/* Section 2: Venue & Experience */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Venue & Experience</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <EditorialInput
                label="Venue"
                placeholder="Restaurant, theater, etc."
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                sizeVariant="lg"
              />
              <EditorialInput
                label="Location"
                placeholder="City or neighborhood"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sizeVariant="lg"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Rating</label>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="cursor-pointer group"
                    >
                      <Star
                        className={`h-10 w-10 transition-all ${
                          rating && value <= rating
                            ? "fill-amber-500 text-amber-500 scale-110"
                            : "text-media-on-surface-variant/20 group-hover:text-media-on-surface-variant/40"
                        }`}
                        fill={rating && value <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                {rating && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(null)}
                    className="cursor-pointer text-xs font-bold uppercase tracking-widest text-media-on-surface-variant hover:text-media-primary"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <EditorialInput
              label="Cost"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              sizeVariant="lg"
            />
          </div>

          {/* Section 3: Narrative & Media */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Narrative & Media</h3>
            </div>

            <EditorialTextarea
              label="Notes"
              placeholder="What made this date special? Any highlights or memories..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              sizeVariant="lg"
            />

            <div className="space-y-6">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Date Photo</label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="flex gap-2 bg-transparent p-0 h-auto">
                  <TabsTrigger value="upload" className="px-6 py-3 rounded-xl border-2 border-transparent data-[state=active]:border-media-secondary data-[state=active]:bg-media-surface-container-high transition-all text-xs font-bold uppercase tracking-widest">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="px-6 py-3 rounded-xl border-2 border-transparent data-[state=active]:border-media-secondary data-[state=active]:bg-media-surface-container-high transition-all text-xs font-bold uppercase tracking-widest">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6 space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-media-outline-variant/30 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-media-surface-container-low transition-all group relative overflow-hidden"
                  >
                    {previewUrl ? (
                      isNoPreviewFormat ? (
                        <div className="relative w-full aspect-video rounded-2xl bg-media-surface-container flex flex-col items-center justify-center gap-3 border-2 border-dashed border-media-outline-variant/50 text-media-primary p-6">
                          <ImageIcon className="w-16 h-16 text-media-on-surface-variant/40 group-hover:scale-110 transition-transform" />
                          <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wider">Preview not available</p>
                            <p className="text-xs text-media-on-surface-variant/70 mt-1 truncate max-w-xs">{selectedFile?.name}</p>
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm font-bold uppercase tracking-widest">Change Photo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-media-outline-variant/10">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm font-bold uppercase tracking-widest">Change Photo</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full bg-media-secondary/10 flex items-center justify-center text-media-secondary group-hover:scale-110 transition-transform duration-500">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-bold uppercase tracking-widest text-media-primary">Click to capture moment</p>
                          <p className="text-[10px] text-media-on-surface-variant font-medium">PNG, JPG, WebP, HEIC, DNG</p>
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

                <TabsContent value="url" className="mt-6 space-y-6">
                  <EditorialInput
                    placeholder="https://example.com/image.jpg"
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    leftIcon={<LinkIcon className="w-5 h-5" />}
                    sizeVariant="lg"
                  />
                  {photoUrl && (
                    <div className="rounded-3xl overflow-hidden border-2 border-media-outline-variant/10 shadow-2xl aspect-video">
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
        </div>
      )}
    </ResponsiveDialog>
  );
}
