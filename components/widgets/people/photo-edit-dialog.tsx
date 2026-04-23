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
import { type Person } from "@/lib/db/people";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";

interface PhotoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person;
  onSuccess: () => void;
}

export function PhotoEditDialog({ open, onOpenChange, person, onSuccess }: PhotoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(person.photo || "");
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
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call the server-side upload API
      const response = await fetch(`/api/people/${person.id}/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }
      
      toast.success("Photo uploaded successfully");
      onSuccess();
      onOpenChange(false);
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
      await updateDatabase(photoUrl);
      toast.success("Photo URL updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update photo URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDatabase = async (newPhotoUrl: string) => {
    const response = await fetch(`/api/people/${person.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...person,
        photo: newPhotoUrl,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update database");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-media-surface text-media-primary border-media-outline-variant/20 font-lexend">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Edit Profile Photo</DialogTitle>
          <DialogDescription className="text-media-on-surface-variant">
            Update {person.name}&apos;s profile picture by uploading a file or providing a URL.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-media-surface-container-low mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-media-secondary data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-media-secondary data-[state=active]:text-white">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-media-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-media-surface-container-low transition-colors"
            >
              {previewUrl || person.photo ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-media-secondary/20">
                  <img 
                    src={previewUrl || person.photo || ""} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-media-surface-container-high flex items-center justify-center text-media-primary/20">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-media-primary">Click to select a file</p>
                <p className="text-xs text-media-on-surface-variant">PNG, JPG or WebP up to 5MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isSubmitting}
                className="w-full bg-media-secondary hover:bg-media-secondary/90 text-white font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save Uploaded Photo"
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo-url" className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant">Image URL</Label>
              <Input 
                id="photo-url" 
                placeholder="https://example.com/image.jpg" 
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="bg-media-surface-container-low border-media-outline-variant/20 focus:ring-media-secondary/20"
              />
            </div>

            <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-media-surface-container-low border border-media-outline-variant/10">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt="URL Preview" 
                  className="w-full h-full object-cover"
                  onError={() => toast.error("Invalid image URL")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-media-primary/10">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={!photoUrl || isSubmitting}
                className="w-full bg-media-secondary hover:bg-media-secondary/90 text-white font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Image URL"
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
