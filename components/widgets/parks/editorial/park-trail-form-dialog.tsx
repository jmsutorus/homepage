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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ParkTrail } from "@/lib/db/parks";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface ParkTrailFormDialogProps {
  parkSlug: string;
  trail: ParkTrail | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ParkTrailFormDialog({ 
  parkSlug, 
  trail, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: ParkTrailFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    distance: "",
    elevation_gain: "",
    difficulty: "Moderate",
    rating: "8",
    date_hiked: "",
    notes: "",
    alltrails_url: ""
  });

  useEffect(() => {
    if (trail) {
      setFormData({
        name: trail.name || "",
        distance: trail.distance?.toString() || "",
        elevation_gain: trail.elevation_gain?.toString() || "",
        difficulty: trail.difficulty || "Moderate",
        rating: trail.rating?.toString() || "8",
        date_hiked: trail.date_hiked || "",
        notes: trail.notes || "",
        alltrails_url: trail.alltrails_url || ""
      });
    } else {
      setFormData({
        name: "",
        distance: "",
        elevation_gain: "",
        difficulty: "Moderate",
        rating: "8",
        date_hiked: new Date().toISOString().split('T')[0],
        notes: "",
        alltrails_url: ""
      });
    }
  }, [trail, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      distance: formData.distance ? parseFloat(formData.distance) : null,
      elevation_gain: formData.elevation_gain ? parseInt(formData.elevation_gain, 10) : null,
      rating: formData.rating ? parseInt(formData.rating, 10) : null,
    };

    try {
      const url = trail 
        ? `/api/parks/${parkSlug}/trails/${trail.id}`
        : `/api/parks/${parkSlug}/trails`;
      
      const method = trail ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(trail ? "Trail updated successfully" : "Trail created successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving trail:", error);
      toast.error("Failed to save trail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!trail) return;
    if (!confirm("Are you sure you want to delete this trail?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/trails/${trail.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Trail deleted successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to delete trail");
      }
    } catch (error) {
      console.error("Error deleting trail:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-media-outline-variant/10 bg-white/95 backdrop-blur-xl rounded-[2rem] font-lexend">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-media-primary tracking-tighter">
            {trail ? "Edit Trail Entry" : "Document New Trail"}
          </DialogTitle>
          <DialogDescription className="text-media-on-surface-variant font-light">
            Capture the essence of your expedition through the wild.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Trail Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jenny Lake Loop" 
                className="rounded-xl border-media-outline-variant/20 focus:ring-media-secondary/20"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Distance (mi)</Label>
                <Input 
                  id="distance" 
                  step="0.1"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="0.0" 
                  className="rounded-xl border-media-outline-variant/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elevation" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Elevation Gain (ft)</Label>
                <Input 
                  id="elevation" 
                  type="number"
                  value={formData.elevation_gain}
                  onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
                  placeholder="0" 
                  className="rounded-xl border-media-outline-variant/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                >
                  <SelectTrigger className="rounded-xl border-media-outline-variant/20">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-media-outline-variant/10">
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Strenuous">Strenuous</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Rating (1-10)</Label>
                <Input 
                  id="rating" 
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="rounded-xl border-media-outline-variant/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Date Hiked</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date_hiked}
                onChange={(e) => setFormData({ ...formData, date_hiked: e.target.value })}
                className="rounded-xl border-media-outline-variant/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Expedition Notes</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe the atmosphere, the views, and the soul of the trail..." 
                className="rounded-xl border-media-outline-variant/20 min-h-[100px] italic font-light"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">AllTrails Link</Label>
              <Input 
                id="url" 
                value={formData.alltrails_url}
                onChange={(e) => setFormData({ ...formData, alltrails_url: e.target.value })}
                placeholder="https://www.alltrails.com/trail/..." 
                className="rounded-xl border-media-outline-variant/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {trail && (
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
              {trail ? "Update Entry" : "Save Expedition"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
