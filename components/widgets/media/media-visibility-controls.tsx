"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaVisibilityControlsProps {
  slug: string;
  type: string;
  initialFeatured: boolean;
  initialPublished: boolean;
}

export function MediaVisibilityControls({
  slug,
  type,
  initialFeatured,
  initialPublished
}: MediaVisibilityControlsProps) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [published, setPublished] = useState(initialPublished);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFeatured = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newFeatured = !featured;
    try {
      const res = await fetch(`/api/media/${type}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: { featured: newFeatured }
        })
      });
      if (res.ok) {
        setFeatured(newFeatured);
      }
    } catch (error) {
      console.error("Failed to update featured state", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublished = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newPublished = !published;
    try {
      const res = await fetch(`/api/media/${type}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: { published: newPublished }
        })
      });
      if (res.ok) {
        setPublished(newPublished);
      }
    } catch (error) {
      console.error("Failed to update published state", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 relative z-20">
      {/* Star for Featured */}
      <button
        onClick={toggleFeatured}
        disabled={isLoading}
        className={cn(
          "p-3 rounded-full border transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer",
          featured 
            ? "bg-media-secondary/10 border-media-secondary/30 text-media-secondary shadow-[0_0_20px_rgba(var(--media-secondary),0.15)]" 
            : "bg-media-surface-container border-media-outline-variant text-media-on-surface-variant hover:text-media-secondary hover:border-media-secondary/30"
        )}
        title={featured ? "Featured" : "Mark as Featured"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Star className={cn("w-5 h-5", featured && "fill-current")} />
        )}
      </button>

      {/* Label for Published */}
      <div className="flex flex-col gap-1">
        <button
          onClick={togglePublished}
          disabled={isLoading}
          className={cn(
            "px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer",
            published 
              ? "bg-media-primary/10 border-media-primary/30 text-media-primary shadow-[0_0_20px_rgba(var(--media-primary),0.15)]" 
              : "bg-media-surface-container border-media-outline-variant text-media-on-surface-variant hover:text-media-primary hover:border-media-primary/30"
          )}
          title={published ? "Published" : "Mark as Published"}
        >
          {published ? "Published" : "Draft"}
        </button>
        <p className="text-[9px] text-media-on-surface-variant font-lexend italic ml-2">
          {published ? "Publicly visible" : "Private draft"}
        </p>
      </div>
    </div>
  );
}
