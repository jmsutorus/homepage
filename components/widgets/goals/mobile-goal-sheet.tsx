"use client";

import { useState, useEffect } from "react";
import { createGoalAction } from "@/lib/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { showCreationError } from "@/lib/success-toasts";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { HapticButton } from "@/components/ui/haptic-button";
import { CalendarIcon, Flag, ChevronDown, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GoalPriority } from "@/lib/db/goals";
import { useRouter } from "next/navigation";
import { motion, PanInfo } from "framer-motion";

interface MobileGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileGoalSheet({ open, onOpenChange }: MobileGoalSheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [isAdding, setIsAdding] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newGoalSlug, setNewGoalSlug] = useState<string | null>(null);

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      if (newGoalSlug) {
        router.push(`/goals/${newGoalSlug}/edit`);
      }
    },
  });

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setTargetDate(undefined);
        setPriority("medium");
        setDetailsOpen(false);
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const goal = await createGoalAction({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        target_date: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
          : undefined,
      });

      setNewGoalSlug(goal.slug);
      triggerSuccess();

    } catch (error) {
      console.error("Failed to create goal:", error);
      showCreationError("goal", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className="flex flex-col h-full font-lexend bg-media-surface-container-lowest"
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
            <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">Establish Vision</SheetTitle>
          </SheetHeader>

          {showSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
              <div className="relative">
                <TreeSuccess size={160} showText={false} />
                <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Vision established</h3>
                <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
                  New strategic objective integrated. The path to achievement has been defined.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* Goal Identity */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                  Vision Identity
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Master Spanish"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold placeholder:text-media-on-surface-variant/20"
                  required
                />
              </div>

              {/* Priority and Date Row */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Strategic Priority
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                    <SelectTrigger className="h-14 border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold">
                      <div className="flex items-center gap-3">
                        <Flag className="h-4 w-4 text-media-secondary" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container border-media-outline-variant">
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">Critical High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-media-on-surface-variant">
                    Terminal Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 justify-start text-left border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-bold",
                          !targetDate && "text-media-on-surface-variant/40"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-media-secondary" />
                        {targetDate ? format(targetDate, "PPP") : "Select target date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-media-outline-variant bg-media-surface-container" align="start">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={setTargetDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
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
                      <Target className="h-4 w-4 text-media-secondary" />
                      Narrative Context
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform text-media-on-surface-variant ${detailsOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <Textarea
                      id="description"
                      placeholder="Describe the magnitude of this achievement..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="resize-none border-2 border-transparent bg-media-surface-container-low focus:border-media-secondary rounded-2xl transition-all font-medium placeholder:text-media-on-surface-variant/20"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <SheetFooter className="border-t border-media-outline-variant/10 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <HapticButton
                type="submit"
                hapticPattern="success"
                disabled={isAdding || !title.trim()}
                className="w-full h-16 text-sm bg-media-primary hover:bg-media-primary/90 text-media-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center"
              >
                {isAdding ? "Initializing..." : "Establish Vision"}
              </HapticButton>
            </SheetFooter>
          </form>
          )}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
