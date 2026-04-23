"use client";

import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ParkTrail } from "@/lib/db/parks";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";

interface ParkTrailPhotoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkSlug: string;
  trail: ParkTrail;
  onSuccess: () => void;
}

export function ParkTrailPhotoEditDialog({ open, onOpenChange, parkSlug, trail, onSuccess }: ParkTrailPhotoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(trail.photo_url || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/parks/${parkSlug}/trails/${trail.id}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload photo");
      }

      toast.success("Trail photo updated successfully");
      onSuccess();
      onOpenChange(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!photoUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/trails/${trail.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...trail,
          photo_url: photoUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update database");
      }

      toast.success("Trail photo updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update photo URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-media-surface text-media-primary border-media-outline-variant/20 font-lexend">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Trail Photo</DialogTitle>
          <DialogDescription className="text-media-on-surface-variant">
            Update the image for trail &quot;{trail.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-media-surface-container-low mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-media-secondary data-[state=active]:text-white transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-media-secondary data-[state=active]:text-white transition-all">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-media-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-media-surface-container-low transition-all group"
            >
              {previewUrl ? (
                <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden shadow-lg mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Change Photo</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-media-secondary/10 flex items-center justify-center text-media-secondary group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-media-primary">Click to upload photo</p>
                    <p className="text-xs text-media-on-surface-variant mt-1">PNG, JPG or WebP (max. 5MB)</p>
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
            
            <DialogFooter>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isSubmitting}
                className="w-full bg-media-secondary hover:bg-media-secondary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-media-secondary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : "Save Uploaded Photo"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-url" className="text-sm font-bold text-media-primary">Image URL</Label>
                <Input 
                  id="photo-url" 
                  placeholder="https://example.com/trail.jpg" 
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="bg-media-surface-container-low border-media-outline-variant/30 h-12 rounded-xl focus:ring-media-secondary/20 focus:border-media-secondary transition-all"
                />
              </div>
              
              {photoUrl && (
                <div className="rounded-xl overflow-hidden border border-media-outline-variant/20 shadow-md aspect-square max-w-[200px] mx-auto">
                  <img 
                    src={photoUrl} 
                    alt="URL Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={!photoUrl || isSubmitting}
                className="w-full bg-media-secondary hover:bg-media-secondary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-media-secondary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : "Save Image URL"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
