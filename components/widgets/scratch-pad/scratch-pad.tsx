"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScratchPad {
  id: number;
  userId: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function ScratchPad() {
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Fetch scratch pad on mount
  useEffect(() => {
    const fetchScratchPad = async () => {
      try {
        const response = await fetch("/api/scratch-pad");
        if (response.ok) {
          const data: ScratchPad = await response.json();
          setContent(data.content);
          setInitialContent(data.content);
        } else {
          toast.error("Failed to load your notes");
        }
      } catch (error) {
        console.error("Failed to fetch scratch pad:", error);
        toast.error("Failed to load your notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScratchPad();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsaved(content !== initialContent);
  }, [content, initialContent]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/scratch-pad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const data: ScratchPad = await response.json();
        setInitialContent(data.content);
        setHasUnsaved(false);
        toast.success("Notes saved", {
          duration: 2000,
        });
      } else {
        const error = await response.json();
        toast.error("Failed to save notes", {
          description: error.error || "Please try again",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to save scratch pad:", error);
      toast.error("Failed to save notes", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsExpanded(false);
  };

  // Generate preview (first 100 chars)
  const preview = content.trim()
    ? content.substring(0, 100) + (content.length > 100 ? "..." : "")
    : "No notes yet. Click to add.";

  if (isLoading) {
    return (
      <Card className="border-2 border-accent/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2 transition-colors", isExpanded ? "border-accent" : "border-accent/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Quick Notes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isExpanded ? (
          <>
            <Textarea
              value={content}
              onChange={handleChange}
              placeholder="Type anything you need to remember..."
              rows={8}
              disabled={isSaving}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasUnsaved && (
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Unsaved changes
                  </p>
                )}
                {!hasUnsaved && initialContent && (
                  <p className="text-xs text-muted-foreground">
                    All changes saved
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {hasUnsaved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsaved}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="cursor-pointer" onClick={handleExpand}>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {preview}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
