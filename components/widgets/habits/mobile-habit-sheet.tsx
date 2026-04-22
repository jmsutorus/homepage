"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, WifiOff, Infinity, Target, Clock } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { createHabitAction } from "@/lib/actions/habits";
import { addToQueue } from "@/lib/pwa/offline-queue";
import { generateTempId } from "@/lib/pwa/optimistic-updates";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { toast } from "sonner";

interface MobileHabitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileHabitSheet({ open, onOpenChange }: MobileHabitSheetProps) {
  const { isOnline } = useNetworkStatus();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [target, setTarget] = useState(1);
  const [isInfinite, setIsInfinite] = useState(false);

  // Collapsible state
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setFrequency("daily");
        setTarget(1);
        setIsInfinite(false);
        setDetailsOpen(false);
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const localTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const habitData = {
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        target,
        isInfinite,
        createdAt: localTimestamp,
      };

      if (!isOnline) {
        const tempId = generateTempId("habit");
        await addToQueue("CREATE_HABIT", habitData, tempId);

        toast.success("Habit saved offline", {
          description: "Will sync when you're back online",
          icon: <WifiOff className="h-4 w-4" />,
        });

        onOpenChange(false);
        return;
      }

      await createHabitAction(habitData);
      showCreationSuccess("habit");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
      showCreationError("habit", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full font-lexend">
          <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
            <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">New Rhythm</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* Habit Identity */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Habit Identity
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Daily Meditation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
                  required
                />
              </div>

              {/* Frequency and Target Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Frequency
                  </Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="h-14 border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container border-media-outline-variant">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="three_times_a_week">3x Week</SelectItem>
                      <SelectItem value="once_a_week">1x Week</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="target" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Target
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                    className="h-14 border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold text-center"
                  />
                </div>
              </div>

              {/* Collapsible Details */}
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between h-14 px-6 border-2 border-media-outline-variant/10 rounded-2xl hover:bg-media-surface-container-low transition-all"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-media-primary">
                      <Clock className="h-4 w-4 text-media-secondary" />
                      Additional Parameters
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform text-media-on-surface-variant ${detailsOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                      Narrative Context
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Define the intention behind this rhythm..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-medium placeholder:text-media-on-surface-variant/20"
                    />
                  </div>

                  <div className="flex items-center justify-between px-6 py-5 bg-media-surface-container-low rounded-2xl border-2 border-transparent">
                    <div className="flex items-center gap-3">
                      <Infinity className="h-5 w-5 text-media-secondary" />
                      <span className="text-sm font-bold text-media-primary">Indefinite Rhythm</span>
                    </div>
                    <Switch checked={isInfinite} onCheckedChange={setIsInfinite} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <SheetFooter className="border-t border-media-outline-variant/10 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <Button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="w-full h-16 text-sm bg-media-primary hover:bg-media-primary/90 text-media-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                {isSaving ? "Synchronizing..." : "Establish Protocol"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
