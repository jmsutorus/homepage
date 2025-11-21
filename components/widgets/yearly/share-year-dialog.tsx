"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Download, Loader2, Copy, Check } from "lucide-react";
import { YearlyStats } from "@/lib/data/yearly-data";
import { ShareableCard } from "./shareable-card";
import { toast } from "sonner";

interface ShareYearDialogProps {
  stats: YearlyStats;
  year: number;
}

export function ShareYearDialog({ stats, year }: ShareYearDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher quality for retina displays
        backgroundColor: "#0f172a", // slate-900 fallback
      });
      return dataUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Create download link
    const link = document.createElement("a");
    link.download = `year-in-review-${year}.png`;
    link.href = dataUrl;
    link.click();

    toast.success("Image downloaded!", {
      description: `year-in-review-${year}.png`,
    });
  };

  const handleCopyToClipboard = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "You can now paste the image anywhere.",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard", {
        description: "Try downloading instead.",
      });
    }
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `year-in-review-${year}.png`, {
          type: "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `My ${year} Year in Review`,
            text: `Check out my ${year} Year in Review!`,
            files: [file],
          });
          return;
        }
      } catch (error) {
        // User cancelled or share failed, fall back to download
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    // Fall back to download if share isn't available
    handleDownload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Your Year in Review</DialogTitle>
          <DialogDescription>
            Download or share your {year} stats as an image.
          </DialogDescription>
        </DialogHeader>

        {/* Preview Container */}
        <div className="relative overflow-auto max-h-[60vh] rounded-lg border">
          <div className="flex justify-center p-4 bg-muted/50">
            <div className="transform scale-[0.6] origin-top">
              <ShareableCard ref={cardRef} stats={stats} year={year} />
            </div>
          </div>

          {/* Loading overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            disabled={isGenerating}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button onClick={handleShare} disabled={isGenerating} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Tips */}
        <p className="text-xs text-muted-foreground text-center">
          Image optimized for Twitter (600x800) and Instagram Stories
        </p>
      </DialogContent>
    </Dialog>
  );
}
