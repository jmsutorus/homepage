"use client";

import { HabitWithStats } from "@/lib/actions/habits";
import { updateHabitAction, deleteHabitAction, toggleHabitCompletionAction } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

interface HabitEditorialCardProps {
  habit: HabitWithStats;
}

const PLACEHOLDER_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCV69UNa7A42YaWW8BiByVn2B2MqKi3qlhnDXHnCQyj9DjrfvDrAyuF2jMG2wewQiKYHarqpVb7FAAh0pmQ_cZ6_cWHGTnH0DWvPx8gWBuu5z4peYq2jfbiX093mzwf-Buk2cyLo3wpqMnnE-MRdqYvTEQ-i6rHEjvpjSKI_4f0xuxCCw0jK2FF6SWkpVmS-kLWBfo2F13KlcWkvqTwT0Q3OI-AfgbftFUdFnkKISm9Umhl61cPtlwDldze-J76fTdlsJlxs4tK__I", // Piano
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKUt4EzyyB4zmS8nqp8ETn1gYs0qkeBu6TNAha8Jzje8k1THbIPQW2Wj4SvvtH79Z7D7JNcrfH6VBxpflSAGS6x16ne8pSE2_Dml6aO0TRgc0g_Rb-UbCxW1HKKbj6NM1awuEvDH7lcL83VgAd33jbP6OE1jwaf20BG7SLJTeIm-etYIh8BANWyKuAhTnxUXd-YYmn300FFvIi-qOH0_yhwefm1D2D6HxcngvucDnF-LHJxG4ljMU2oBdjqadO8pv5Z6JTypp2DgM", // Abstract
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdxpU8f_uEhyqefhmLg1GKIIXmyYjnzzg16gpboFWZuCtAhHU74h4yatvTh2Otr1dxr-uUPVt5lktjs63GExsWgLKylS3RJ_wZeUmqhhD-JCIbrHMWvLU5gOuBqR-10Vmy5SwC4RPhqy1cQ13CXoJzDogsxxs_nVOHMRwbKIGzA6hPpb50sPy5E_LNrF5TGvY1ht4dk0pscXxgCIq1d1devlpEr9CrA-rDJu5puNTZhyIg1Ruydl2CSEVHo8leAhOCwl60AS95P10", // Nature
];

export function HabitEditorialCard({ habit }: HabitEditorialCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pick a placeholder based on habit ID for stability
  const placeholderImage = PLACEHOLDER_IMAGES[habit.id % PLACEHOLDER_IMAGES.length];
  const isCompletedToday = habit.completionDates.includes(format(new Date(), "yyyy-MM-dd"));

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await toggleHabitCompletionAction(habit.id, format(new Date(), "yyyy-MM-dd"));
      toast.success(isCompletedToday ? "Completion removed" : "Habit completed for today!");
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (confirm("Archive this habit? It will no longer show in your daily list.")) {
      setIsUpdating(true);
      try {
        await updateHabitAction(habit.id, { active: false });
        toast.success("Habit archived");
      } catch (error) {
        toast.error("Failed to archive habit");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Permanently delete this habit and all history?")) {
      setIsDeleting(true);
      try {
        await deleteHabitAction(habit.id);
        toast.success("Habit deleted");
      } catch (error) {
        toast.error("Failed to delete habit");
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group bg-media-surface-container-lowest rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300",
        !habit.active && "opacity-60"
      )}
    >
      <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden bg-media-surface-container-high">
        {placeholderImage ? (
          <img 
            alt={habit.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={placeholderImage} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Target className="w-16 h-16 text-media-primary" />
          </div>
        )}
        {(habit.target > 0 && habit.stats.totalCompletions >= habit.target) && (
          <div className="absolute top-6 left-6">
            <span className="bg-media-primary text-white px-3 py-1 text-[10px] uppercase tracking-tighter font-bold rounded-full">
              Target Reached
            </span>
          </div>
        )}
      </div>

      <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-media-primary leading-tight font-lexend">
              {habit.title}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleArchive}
                className="cursor-pointer material-symbols-outlined text-media-outline-variant hover:text-media-secondary transition-colors"
                title="Archive"
              >
                archive
              </button>
              <button 
                onClick={handleDelete}
                className="cursor-pointer material-symbols-outlined text-media-outline-variant hover:text-media-error transition-colors"
                title="Delete"
              >
                delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 border-b border-media-surface-container pb-8">
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-media-on-surface-variant font-semibold mb-1">
                Streak
              </span>
              <span className="text-xl font-bold text-media-secondary font-lexend">
                {habit.stats.currentStreak} Day Streak
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-media-on-surface-variant font-semibold mb-1">
                Total
              </span>
              <span className="text-xl font-bold text-media-primary font-lexend">
                {habit.stats.totalCompletions} Total
              </span>
            </div>
          </div>

          <p className="text-sm text-media-on-surface-variant mb-10 italic">
            Active for {habit.stats.daysExisted} days • {habit.description || "Consistent growth"}
          </p>
        </div>

        <Button 
          disabled={isUpdating}
          onClick={handleComplete}
          className={cn(
            "w-full py-6 rounded-xl font-bold text-sm uppercase tracking-widest transition-all font-lexend",
            isCompletedToday 
              ? "bg-media-surface-container-highest text-media-primary hover:bg-media-primary hover:text-white"
              : "bg-media-secondary text-white hover:brightness-110 active:scale-95"
          )}
        >
          {isUpdating ? "Processing..." : isCompletedToday ? "Completed Today" : "Mark as Complete"}
        </Button>
      </div>
    </motion.div>
  );
}
