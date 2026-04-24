"use client";

import { createHabitAction } from "@/lib/actions/habits";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { WifiOff, Infinity, X } from "lucide-react";
import { useState } from "react";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { addToQueue } from "@/lib/pwa/offline-queue";
import { generateTempId } from "@/lib/pwa/optimistic-updates";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CreateHabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHabitForm({ open, onOpenChange }: CreateHabitFormProps) {
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const frequency = formData.get("frequency") as string;
    const target = parseInt(formData.get("target") as string) || 1;
    const isInfinite = formData.get("isInfinite") === "on";

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
        title,
        description,
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
      setShowSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to create habit:", error);
      toast.error("Failed to create habit", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="p-0 border-none sm:max-w-3xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl max-h-[90vh] flex flex-col"
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <SuccessCheck size={120} />
            <h3 className="text-3xl font-bold text-media-primary tracking-tight font-lexend animate-in fade-in slide-in-from-bottom-4 duration-500">
              Habit Established
            </h3>
            <p className="text-media-on-surface-variant text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              Your new rhythm has been integrated into the system.
            </p>
          </div>
        ) : (
          <>
            {/* Premium Header */}
            <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
              <div className="flex justify-between items-start z-10 relative">
                <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend uppercase">
                  Define New Rhythm
                </h2>
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-media-on-primary-container/80 text-sm max-w-md z-10 relative font-medium leading-relaxed">
                Establish the parameters for your daily discipline. Consistency is the primary catalyst for transformation.
              </p>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Section 01: The Essence */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
                  <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">The Essence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-12 space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Habit Identity</label>
                    <div className="relative">
                      <input 
                        autoFocus
                        required
                        type="text"
                        name="title"
                        className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                        placeholder="e.g. Daily Meditation"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-12 space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Narrative Context (Optional)</label>
                    <div className="relative">
                      <textarea 
                        name="description"
                        rows={2}
                        className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
                        placeholder="Define the intention behind this rhythm..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 02: Configuration */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
                  <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Frequency & Goal</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Occurrence Frequency</label>
                    <Select name="frequency" defaultValue="daily">
                      <SelectTrigger className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-media-surface-container border-media-outline-variant">
                        <SelectItem value="daily" className="font-lexend">Daily</SelectItem>
                        <SelectItem value="every_other_day" className="font-lexend">Every Other Day</SelectItem>
                        <SelectItem value="three_times_a_week" className="font-lexend">Three Times A Week</SelectItem>
                        <SelectItem value="once_a_week" className="font-lexend">Once A Week</SelectItem>
                        <SelectItem value="every_week" className="font-lexend">Every Week</SelectItem>
                        <SelectItem value="monthly" className="font-lexend">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Target Threshold</label>
                    <div className="relative">
                      <input 
                        type="number"
                        name="target"
                        min="1"
                        defaultValue="1"
                        required
                        className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Temporal Nature</label>
                  <div className="flex items-center justify-between px-8 py-6 bg-media-surface-container-low rounded-2xl border-2 border-transparent">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-media-secondary/10 rounded-xl">
                        <Infinity className="h-6 w-6 text-media-secondary" />
                      </div>
                      <div>
                        <span className="block text-media-primary font-bold font-lexend">Indefinite Rhythm</span>
                        <span className="text-xs text-media-on-surface-variant/60 font-medium">This discipline has no terminal date.</span>
                      </div>
                    </div>
                    <Switch name="isInfinite" id="isInfinite" />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-10 pt-10 border-t border-media-outline-variant/10 shrink-0">
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors font-lexend"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer px-10 py-5 bg-media-secondary text-media-on-secondary rounded-2xl font-bold tracking-tight shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-3 font-lexend uppercase"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Establish Protocol'
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
