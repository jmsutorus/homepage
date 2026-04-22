"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScratchPadData {
  content: string;
  updated_at: string;
}

export function EditorialScratchPad() {
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchScratchPad = async () => {
      try {
        const response = await fetch("/api/scratch-pad");
        if (response.ok) {
          const data: ScratchPadData = await response.json();
          setContent(data.content);
          setInitialContent(data.content);
          if (data.updated_at) {
            setLastSaved(new Date(data.updated_at));
          }
        }
      } catch (error) {
        console.error("Failed to fetch scratch pad:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScratchPad();
  }, []);

  const handleSave = async (contentToSave: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/scratch-pad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSave }),
      });
      if (response.ok) {
        const data: ScratchPadData = await response.json();
        setInitialContent(data.content);
        setLastSaved(new Date());
        setHasUnsaved(false);
      }
    } catch (error) {
      console.error("Failed to save scratch pad:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsaved(newContent !== initialContent);

    // Auto save logic
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1500); // Auto save after 1.5s typing pause
  };
  
  const handleSaveClick = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    handleSave(content);
  }

  const getTimeAgoText = () => {
    if (isSaving) return "Saving...";
    if (hasUnsaved) return "Unsaved changes";
    if (!lastSaved) return "Never saved";
    
    const diff = Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000);
    if (diff < 1) return "Last saved just now";
    return `Last saved ${diff}m ago`;
  };

  return (
    <div className={cn("flex flex-col gap-4 transition-all duration-300", isExpanded ? "lg:col-span-12 h-[500px]" : "lg:col-span-4 h-full")}>
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold">Scratchpad</h4>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-media-outline cursor-pointer hover:text-media-secondary group p-1">
          <span className="material-symbols-outlined text-sm transition-colors">
            {isExpanded ? "close_fullscreen" : "open_in_full"}
          </span>
        </button>
      </div>
      <div className="bg-media-surface-container-low rounded-xl p-6 flex flex-col border border-media-outline-variant/30 flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-media-muted/50 rounded" />
        ) : (
          <textarea 
            className="w-full h-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed text-media-on-surface resize-none placeholder:text-media-on-surface-variant/50 outline-none" 
            placeholder="Capture a passing thought..."
            value={content}
            onChange={handleChange}
          ></textarea>
        )}
        <div className="mt-4 pt-4 border-t border-media-outline-variant/20 flex justify-between items-center h-8">
          <span className="text-[10px] text-media-on-surface-variant italic transition-opacity">{getTimeAgoText()}</span>
          {(hasUnsaved || isSaving) && (
             <button onClick={handleSaveClick} disabled={isSaving} className="cursor-pointer text-[10px] font-bold text-media-secondary uppercase tracking-widest hover:underline disabled:opacity-50 transition-opacity">
               Save Now
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
