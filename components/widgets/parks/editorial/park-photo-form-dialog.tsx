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
import { Loader2, Trash2 } from "lucide-react";

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
  }, [photo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      order_index: parseInt(formData.order_index, 10)
    };

    try {
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
      toast.error("Failed to save photo");
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
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Photo URL</Label>
              <Input 
                id="url" 
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://images.unsplash.com/..." 
                className="rounded-xl border-media-outline-variant/20 focus:ring-media-secondary/20"
                required
              />
            </div>

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
