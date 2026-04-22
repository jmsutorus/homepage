"use client";

import { useEffect, useState } from "react";
import { QuickLink } from "@/lib/db/quick-links";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuickLinkCategory {
  id: number;
  name: string;
  order_index: number;
  links: QuickLink[];
}

export function EditorialQuickLinks() {
  const [categories, setCategories] = useState<QuickLinkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuickLinks = async () => {
    try {
      const response = await fetch("/api/quick-links");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch quick links:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent, link: QuickLink) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/quick-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLink.id,
          title: editTitle,
          url: editUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update link");
      
      toast.success("Link updated successfully");
      setEditingLink(null);
      fetchQuickLinks();
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Failed to update link");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-media-surface-container-low rounded-xl p-4 h-24 border border-media-outline-variant/30" />
        ))}
      </div>
    );
  }

  // Flatten all links across categories and taking the first 4 for the 2x2 grid
  const allLinks = categories.flatMap(c => c.links).slice(0, 4);

  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold">Quick Navigation</h4>
      <div className="grid grid-cols-2 gap-4 h-full min-h-[200px]">
        {allLinks.map((link) => {
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-media-surface-container-low hover:bg-media-primary-container hover:text-white transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group border border-media-outline-variant/30 text-media-on-surface relative"
            >
              <button
                onClick={(e) => handleEditClick(e, link)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 text-media-secondary hover:bg-media-secondary hover:text-white transition-all duration-200 border border-media-secondary/10 cursor-pointer flex items-center justify-center shadow-sm"
                title="Edit Link"
              >
                <MaterialSymbol icon="edit" size={12} fill />
              </button>
              <span className="text-xs font-bold tracking-tight text-center line-clamp-2 uppercase">{link.title}</span>
            </a>
          );
        })}
        {/* Fill empty spots if less than 4 */}
        {Array.from({ length: Math.max(0, 4 - allLinks.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-media-surface-container-low border border-media-outline-variant/30 rounded-xl p-4 opacity-50 flex items-center justify-center" />
        ))}
      </div>

      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="bg-media-surface dark:bg-media-primary border-media-outline-variant/20 font-lexend">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-media-primary">Edit Quick Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-title" className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant">Title</Label>
              <Input
                id="link-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-media-surface-container-low border-media-outline-variant/30 focus:ring-media-secondary/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url" className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant">URL</Label>
              <Input
                id="link-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="bg-media-surface-container-low border-media-outline-variant/30 focus:ring-media-secondary/20 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingLink(null)}
              className="rounded-xl border-media-outline-variant/30 font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLink}
              disabled={saving}
              className="rounded-xl bg-media-secondary hover:bg-media-secondary/90 font-bold uppercase tracking-widest text-[10px]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
