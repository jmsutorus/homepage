"use client";

import { createGoalAction } from "@/lib/actions/goals";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, CalendarIcon, Flag } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useRouter } from "next/navigation";

import type { GoalPriority } from "@/lib/db/goals";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateGoalForm({ open, onOpenChange, onCreated }: CreateGoalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<GoalPriority>("medium");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const goal = await createGoalAction({
        title,
        description: description || undefined,
        priority,
        target_date: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
          : undefined,
      });

      setShowSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
        setTargetDate(undefined);
        setPriority("medium");
        onCreated?.();
        router.push(`/goals/${goal.slug}`);
      }, 2500);

    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="p-0 border-none sm:max-w-3xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl max-h-[90vh] flex flex-col font-lexend"
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <TreeSuccess size={160} showText={false} />
            <DialogTitle className="text-3xl font-bold text-media-primary tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
              Vision Manifested
            </DialogTitle>
            <p className="text-media-on-surface-variant text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              Opening your tactical dashboard...
            </p>
          </div>

        ) : (
          <>
            {/* Premium Header */}
            <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
              <div className="flex justify-between items-start z-10 relative">
                <DialogTitle className="text-3xl font-bold tracking-tight text-media-on-primary-container uppercase">
                  Establish New Vision
                </DialogTitle>
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <DialogDescription className="text-media-on-primary-container/80 text-sm max-w-lg z-10 relative font-medium leading-relaxed">
                Define the terminal state of your ambition. Setting clear parameters is the first stage of transmutation from dream to reality.
              </DialogDescription>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Section 01: The Essence */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
                  <h3 className="text-xl font-bold text-media-primary tracking-tight">The Essence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-12 space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Vision Identity</label>
                    <div className="relative">
                      <input 
                        autoFocus
                        required
                        type="text"
                        name="title"
                        className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl placeholder:text-media-on-surface-variant/20"
                        placeholder="e.g. Master the Spanish Language"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-12 space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Narrative Context (Optional)</label>
                    <div className="relative">
                      <textarea 
                        name="description"
                        rows={2}
                        className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg resize-none placeholder:text-media-on-surface-variant/20"
                        placeholder="Describe the magnitude of this achievement..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 02: Parameters */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
                  <h3 className="text-xl font-bold text-media-primary tracking-tight">Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Terminal Date (Optional)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "w-full px-8 py-5 flex items-center justify-between bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all font-bold text-lg",
                            !targetDate && "text-media-on-surface-variant/40"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5" />
                            {targetDate ? format(targetDate, "PPP") : "Select target date"}
                          </span>
                        </button>
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

                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Strategic Priority</label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                      <SelectTrigger className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg">
                        <div className="flex items-center gap-3">
                          <Flag className="h-5 w-5" />
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
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-10 pt-10 border-t border-media-outline-variant/10 shrink-0">
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer px-10 py-5 bg-media-secondary text-media-on-secondary rounded-2xl font-bold tracking-tight shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-3 uppercase"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Establish Vision'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
