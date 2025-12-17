"use client";

import { HabitWithStats } from "@/lib/actions/habits";
import { updateHabitAction, deleteHabitAction, completeHabitAction } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Trash2, GripVertical, Flame, Calendar, TrendingUp, CheckCircle2, Target, Infinity, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AnimatedProgress } from "@/components/ui/animations/animated-progress";
import { fireAchievementConfetti } from "@/lib/utils/confetti";
import { HabitHeatmap } from "./habit-heatmap";

interface HabitsListProps {
  habits: HabitWithStats[];
}

// Generate catchy motivational message based on stats
function getMotivationalMessage(
  title: string,
  stats: HabitWithStats['stats'],
  target: number,
  isCompleted: boolean,
  isInfinite: boolean
): string {
  const { currentStreak, totalCompletions } = stats;

  // Helper function to pick a random message from an array
  const pickRandom = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // If habit is marked as completed
  if (isCompleted) {
    const messages = [
      `🎉 Congratulations! You've completed the ${title.toLowerCase()} habit with ${totalCompletions} total completions!`,
      `🏆 Mission accomplished! ${totalCompletions} completions for ${title.toLowerCase()}. You're a champion!`,
      `✨ Victory! You've conquered ${title.toLowerCase()} with ${totalCompletions} completions. Well done!`
    ];
    return pickRandom(messages);
  }

  // Check if target is reached (habit can be completed) - not applicable for infinite habits
  if (!isInfinite && totalCompletions >= target) {
    const messages = [
      `🏆 Amazing! You've reached your target of ${target} completions (${totalCompletions} total). Ready to mark this habit as complete?`,
      `🎯 Target achieved! ${totalCompletions}/${target} completions done. Time to celebrate and mark this complete?`,
      `⭐ Milestone unlocked! You hit ${target} completions (${totalCompletions} total). Mark it complete and move on to your next goal?`
    ];
    return pickRandom(messages);
  }

  // For infinite habits, use simpler messages without target references
  const progressSuffix = isInfinite ? `${totalCompletions} total.` : `${totalCompletions}/${target} total.`;

  // Progress messages
  if (currentStreak === 0) {
    if (totalCompletions === 0) {
      return `Ready to start your ${title.toLowerCase()} journey? Today's the day!`;
    }
    return `Time to get back on track with ${title.toLowerCase()}! ${progressSuffix}`;
  }

  if (currentStreak === 1) {
    return `You've completed ${title.toLowerCase()}! Great work! ${progressSuffix} 🌟`;
  }

  if (currentStreak >= 2 && currentStreak < 5) {
    const messages = [
      `${currentStreak} completions in a row! You're building momentum! ${progressSuffix} 🚀`,
      `${currentStreak} straight! The consistency is paying off! ${progressSuffix} ⚡`,
      `${currentStreak} in the books! You're getting into a rhythm! ${progressSuffix} 🎵`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 5 && currentStreak < 10) {
    const messages = [
      `${currentStreak} completions strong! Keep the fire burning! ${progressSuffix} 🔥`,
      `${currentStreak} in a row! You're on fire! ${progressSuffix} 💥`,
      `${currentStreak} completions! This is becoming automatic! ${progressSuffix} ✨`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 10 && currentStreak < 20) {
    const messages = [
      `${currentStreak} completions! You're on a roll! ${progressSuffix} 💪`,
      `${currentStreak} straight! Absolutely crushing it! ${progressSuffix} 🚀`,
      `${currentStreak} completions! Nothing can stop you now! ${progressSuffix} ⚡`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 20 && currentStreak < 30) {
    const messages = [
      `${currentStreak} completions! This is becoming a solid habit! ${progressSuffix} ⭐`,
      `${currentStreak} in a row! You're in the zone! ${progressSuffix} 🌟`,
      `${currentStreak} completions! Elite consistency! ${progressSuffix} 👑`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 30 && currentStreak < 50) {
    const messages = [
      `${currentStreak} completions! You're unstoppable! ${progressSuffix} 🎯`,
      `${currentStreak} straight! Legendary dedication! ${progressSuffix} 🏆`,
      `${currentStreak} completions! You've mastered this habit! ${progressSuffix} 💎`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 50) {
    const messages = [
      `${currentStreak} completions! Absolutely legendary! ${progressSuffix} 👑`,
      `${currentStreak} in a row! You're an inspiration! ${progressSuffix} 🌟`,
      `${currentStreak} completions! Hall of Fame material! ${progressSuffix} 🏅`
    ];
    return pickRandom(messages);
  }

  return `${currentStreak} completions! Keep going! ${progressSuffix}`;
}

export function HabitsList({ habits }: HabitsListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);
  const [expandedHeatmaps, setExpandedHeatmaps] = useState<Set<number>>(new Set());

  const toggleHeatmap = (habitId: number) => {
    setExpandedHeatmaps(prev => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const handleToggleActive = async (habit: HabitWithStats) => {
    await updateHabitAction(habit.id, { active: !habit.active });
  };

  const handleComplete = async (id: number) => {
    if (confirm("Mark this habit as completed? This will deactivate the habit but preserve your completion history.")) {
      setIsCompleting(id);
      await completeHabitAction(id);
      setIsCompleting(null);

      // Fire confetti for completing the habit target
      fireAchievementConfetti("habit-target-reached");

      toast.success("Habit marked as complete!", {
        description: "Great job on reaching your target!"
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this habit? This will also delete all completion history.")) {
      setIsDeleting(id);
      await deleteHabitAction(id);
      setIsDeleting(null);
      toast.success("Habit deleted", {
        description: "The habit has been permanently removed."
      });
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No habits found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {habits.map((habit) => {
          // Infinite habits never show "can be completed" UI
          const canBeCompleted = !habit.is_infinite && habit.stats.totalCompletions >= habit.target && !habit.completed;
          const motivationalMessage = getMotivationalMessage(
            habit.title,
            habit.stats,
            habit.target,
            habit.completed,
            habit.is_infinite
          );

          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.2 }}
            >
              {/* Desktop View */}
              <div className="hidden md:block">
                <Card className={cn(
                  "transition-opacity",
                  !habit.active && "opacity-60",
                  habit.completed && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="cursor-move text-muted-foreground pt-1">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Title and Description */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={cn("font-medium text-lg", !habit.active && "line-through")}>
                              {habit.title}
                            </h3>
                            {habit.is_infinite && (
                              <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400">
                                <Infinity className="h-3 w-3 mr-1" />
                                Never ending
                              </Badge>
                            )}
                            {canBeCompleted && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                                🎯 Target Reached!
                              </Badge>
                            )}
                          </div>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                          )}
                        </div>

                        {/* Motivational Message */}
                        <div className={cn(
                          "text-sm font-medium px-3 py-2 rounded-md border",
                          habit.completed
                            ? "text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                            : canBeCompleted
                              ? "text-yellow-700 dark:text-yellow-400 bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800"
                              : "text-primary bg-primary/5 border-primary/20"
                        )}>
                          {motivationalMessage}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-muted-foreground">Streak:</span>
                            <span className="font-semibold">{habit.stats.currentStreak} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">Existed:</span>
                            <span className="font-semibold">{habit.stats.daysExisted} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-semibold">{habit.stats.totalCompletions} times</span>
                          </div>
                        </div>

                        {/* Progress Bar - only show for non-infinite habits */}
                        {!habit.is_infinite && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Target className="h-3.5 w-3.5" />
                                <span>Progress to target</span>
                              </div>
                              <span className="font-medium">
                                {habit.stats.totalCompletions}/{habit.target}
                              </span>
                            </div>
                            <AnimatedProgress
                              value={habit.stats.totalCompletions}
                              max={habit.target}
                              size="md"
                              color={
                                habit.completed
                                  ? "success"
                                  : habit.stats.totalCompletions >= habit.target
                                    ? "warning"
                                    : "primary"
                              }
                            />
                          </div>
                        )}

                        {/* Frequency and Target */}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{habit.frequency.replaceAll("_", " ")}</span>
                          {!habit.is_infinite && (
                            <>
                              <span>•</span>
                              <span>Target: {habit.target}x</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 pt-1">
                        {/* Mark Complete Button - show for target-reached OR infinite habits */}
                        {(canBeCompleted || (habit.is_infinite && !habit.completed)) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleComplete(habit.id)}
                            disabled={isCompleting === habit.id}
                            className="bg-green-600 hover:bg-green-700 cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {isCompleting === habit.id ? "Completing..." : "Mark Complete"}
                          </Button>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Active</span>
                            <Switch
                              checked={habit.active}
                              onCheckedChange={() => handleToggleActive(habit)}
                              disabled={habit.completed}
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(habit.id)}
                            disabled={isDeleting === habit.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer group"
                          >
                            <motion.div
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Heatmap */}
                    <Collapsible open={expandedHeatmaps.has(habit.id)} onOpenChange={() => toggleHeatmap(habit.id)}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-muted-foreground hover:text-foreground mt-2 cursor-pointer"
                        >
                          <span className="text-xs">Completion History</span>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            expandedHeatmaps.has(habit.id) && "rotate-180"
                          )} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3">
                        <HabitHeatmap
                          completionDates={habit.completionDates}
                          createdAt={habit.created_at}
                          completedAt={habit.updated_at}
                          isCompleted={habit.completed}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile View */}
              <div className={cn(
                "md:hidden flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
                !habit.active && "opacity-60 bg-muted/50",
                habit.completed && "border-green-500/30 bg-green-50/30 dark:bg-green-950/20"
              )}>
                {/* Checkbox for quick completion (if not already completed for the day) */}
                {canBeCompleted ? (
                   <div 
                      className="h-6 w-6 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500 text-white shadow-sm cursor-pointer"
                      onClick={() => handleComplete(habit.id)}
                   >
                      <CheckCircle2 className="h-4 w-4" />
                   </div>
                 ) : habit.is_infinite && !habit.completed ? (
                   <div 
                     className="h-6 w-6 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500 text-white shadow-sm cursor-pointer"
                     onClick={() => handleComplete(habit.id)}
                   >
                     <Infinity className="h-3.5 w-3.5" />
                   </div>
                 ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/0" />
                    </div>
                 )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium truncate", !habit.active && "line-through text-muted-foreground")}>
                      {habit.title}
                    </span>
                    {habit.is_infinite && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-purple-500 text-purple-700 dark:text-purple-400">
                        ∞
                      </Badge>
                    )}
                    {canBeCompleted && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-yellow-500 text-yellow-700 dark:text-yellow-400">
                        Target!
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                       <Flame className="h-3 w-3 text-orange-500" />
                       <span>{habit.stats.currentStreak}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                       {habit.is_infinite ? (
                         <>
                           <TrendingUp className="h-3 w-3" />
                           <span>{habit.stats.totalCompletions} total</span>
                         </>
                       ) : (
                         <>
                           <Target className="h-3 w-3" />
                           <span>{habit.stats.totalCompletions}/{habit.target}</span>
                         </>
                       )}
                    </div>
                  </div>
                  {/* Progress bar - only show for non-infinite habits */}
                  {!habit.is_infinite && (
                    <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", 
                          habit.completed ? "bg-green-500" : 
                          habit.stats.totalCompletions >= habit.target ? "bg-yellow-500" : "bg-primary"
                        )}
                        style={{ width: `${Math.min(100, (habit.stats.totalCompletions / habit.target) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start">
                   {/* We can use a dropdown here similar to tasks */}
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-1"
                      onClick={(e) => {
                          e.stopPropagation();
                          // Could open a sheet or dropdown. For now, let's just reuse the desktop delete/toggle logic in a simpler way or just show delete if that is the main action
                          // Actually, best to replicate the "More" menu from tasks if possible, or just show toggle active / delete
                      }}
                   >
                     {/* For this iteration, let's keep it simple and just show the 'More' menu if we had one, 
                         but since we don't have a standardized 'More' menu component for habits yet, 
                         let's just expose the Delete action or perhaps a context menu trigger?
                         The design requested "Use the task screen as inspiration". Tasks use a ContextMenu/Dropdown.
                         Let's leave it as just the delete button for now to keep it clean, OR add a dropdown.
                      */}
                      
                      {/* Let's try to add a Dropdown here for mobile actions */}
                   </Button>
                   <div className="flex flex-col gap-1">
                      <Switch
                        checked={habit.active}
                        onCheckedChange={() => handleToggleActive(habit)}
                        disabled={habit.completed}
                        className="scale-75 origin-right"
                      />
                       <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(habit.id)}
                            disabled={isDeleting === habit.id}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                           <Trash2 className="h-4 w-4" />
                       </Button>
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
