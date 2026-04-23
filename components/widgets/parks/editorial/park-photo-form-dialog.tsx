"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkPhoto } from "@/lib/db/parks";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";

interface ParkPhotoFormDialogProps {
  parkSlug: string;
  photo: ParkPhoto | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ParkPhotoFormDialog({ 
  parkSlug, 
  photo, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: ParkPhotoFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    url: "",
    caption: "",
    date_taken: "",
    order_index: "0"
  });

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

  useEffect(() => {
    if (photo) {
      setFormData({
        url: photo.url || "",
        caption: photo.caption || "",
        date_taken: photo.date_taken || "",
        order_index: photo.order_index?.toString() || "0"
      });
    } else {
      setFormData({
        url: "",
        caption: "",
        date_taken: new Date().toISOString().split('T')[0],
        order_index: "0"
      });
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [photo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Handle file upload if present
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("caption", formData.caption);
        uploadFormData.append("date_taken", formData.date_taken);
        uploadFormData.append("order_index", formData.order_index);

        const uploadResponse = await fetch(`/api/parks/${parkSlug}/photos/upload`, {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload photo");
        }

        toast.success(photo ? "Photo updated with new upload" : "Photo uploaded successfully");
        onSuccess();
        onOpenChange(false);
        return;
      }

      // Handle URL-based update/creation
      const payload = {
        ...formData,
        order_index: parseInt(formData.order_index, 10)
      };

      const url = photo 
        ? `/api/parks/${parkSlug}/photos/${photo.id}`
        : `/api/parks/${parkSlug}/photos`;
      
      const method = photo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(photo ? "Photo updated successfully" : "Photo added successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photo) return;
    if (!confirm("Are you sure you want to delete this photo?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/photos/${photo.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Photo deleted successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border-media-outline-variant/10 bg-white/95 backdrop-blur-xl rounded-[2rem] font-lexend">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-media-primary tracking-tighter">
            {photo ? "Edit Visual Memory" : "Add New Memory"}
          </DialogTitle>
          <DialogDescription className="text-media-on-surface-variant font-light">
            Frame a moment from your expedition.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue={photo ? "url" : "upload"} className="w-full">
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
                {previewUrl || (photo && photo.url && photo.url.includes('firebase')) ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                    <img src={previewUrl || photo?.url} alt="Preview" className="w-full h-full object-cover" />
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
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Photo URL</Label>
                <Input 
                  id="url" 
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..." 
                  className="rounded-xl border-media-outline-variant/20 focus:ring-media-secondary/20"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Caption</Label>
              <Input 
                id="caption" 
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="A brief description of the moment..." 
                className="rounded-xl border-media-outline-variant/20 focus:ring-media-secondary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Date Taken</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={formData.date_taken}
                  onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                  className="rounded-xl border-media-outline-variant/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Display Order</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                  className="rounded-xl border-media-outline-variant/20"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {photo && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            )}
            <div className="flex-grow" />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-media-outline-variant/20"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isDeleting}
              className="bg-media-primary text-white rounded-xl px-8 hover:bg-media-secondary transition-all font-black uppercase tracking-widest text-[10px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {photo ? "Update Photo" : "Add Photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
