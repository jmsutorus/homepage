"use client";

import { HabitWithStats } from "@/lib/actions/habits";
import { updateHabitAction, deleteHabitAction, completeHabitAction } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Flame, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HabitsListProps {
  habits: HabitWithStats[];
}

// Generate catchy motivational message based on stats
function getMotivationalMessage(
  title: string,
  stats: HabitWithStats['stats'],
  target: number,
  isCompleted: boolean
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

  // Check if target is reached (habit can be completed)
  if (totalCompletions >= target) {
    const messages = [
      `🏆 Amazing! You've reached your target of ${target} completions (${totalCompletions} total). Ready to mark this habit as complete?`,
      `🎯 Target achieved! ${totalCompletions}/${target} completions done. Time to celebrate and mark this complete?`,
      `⭐ Milestone unlocked! You hit ${target} completions (${totalCompletions} total). Mark it complete and move on to your next goal?`
    ];
    return pickRandom(messages);
  }

  // Progress messages
  if (currentStreak === 0) {
    if (totalCompletions === 0) {
      return `Ready to start your ${title.toLowerCase()} journey? Today's the day!`;
    }
    return `Time to get back on track with ${title.toLowerCase()}! ${totalCompletions}/${target} completions so far.`;
  }

  if (currentStreak === 1) {
    return `You've completed ${title.toLowerCase()}! Great work! ${totalCompletions}/${target} completions total. 🌟`;
  }

  if (currentStreak >= 2 && currentStreak < 5) {
    const messages = [
      `${currentStreak} completions in a row! You're building momentum! ${totalCompletions}/${target} total. 🚀`,
      `${currentStreak} straight! The consistency is paying off! ${totalCompletions}/${target} total. ⚡`,
      `${currentStreak} in the books! You're getting into a rhythm! ${totalCompletions}/${target} total. 🎵`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 5 && currentStreak < 10) {
    const messages = [
      `${currentStreak} completions strong! Keep the fire burning! ${totalCompletions}/${target} total. 🔥`,
      `${currentStreak} in a row! You're on fire! ${totalCompletions}/${target} total. 💥`,
      `${currentStreak} completions! This is becoming automatic! ${totalCompletions}/${target} total. ✨`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 10 && currentStreak < 20) {
    const messages = [
      `${currentStreak} completions! You're on a roll! ${totalCompletions}/${target} total. 💪`,
      `${currentStreak} straight! Absolutely crushing it! ${totalCompletions}/${target} total. 🚀`,
      `${currentStreak} completions! Nothing can stop you now! ${totalCompletions}/${target} total. ⚡`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 20 && currentStreak < 30) {
    const messages = [
      `${currentStreak} completions! This is becoming a solid habit! ${totalCompletions}/${target} total. ⭐`,
      `${currentStreak} in a row! You're in the zone! ${totalCompletions}/${target} total. 🌟`,
      `${currentStreak} completions! Elite consistency! ${totalCompletions}/${target} total. 👑`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 30 && currentStreak < 50) {
    const messages = [
      `${currentStreak} completions! You're unstoppable! ${totalCompletions}/${target} total. 🎯`,
      `${currentStreak} straight! Legendary dedication! ${totalCompletions}/${target} total. 🏆`,
      `${currentStreak} completions! You've mastered this habit! ${totalCompletions}/${target} total. 💎`
    ];
    return pickRandom(messages);
  }

  if (currentStreak >= 50) {
    const messages = [
      `${currentStreak} completions! Absolutely legendary! ${totalCompletions}/${target} total. 👑`,
      `${currentStreak} in a row! You're an inspiration! ${totalCompletions}/${target} total. 🌟`,
      `${currentStreak} completions! Hall of Fame material! ${totalCompletions}/${target} total. 🏅`
    ];
    return pickRandom(messages);
  }

  return `${currentStreak} completions! Keep going! ${totalCompletions}/${target} total.`;
}

export function HabitsList({ habits }: HabitsListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);

  const handleToggleActive = async (habit: HabitWithStats) => {
    await updateHabitAction(habit.id, { active: !habit.active });
  };

  const handleComplete = async (id: number) => {
    if (confirm("Mark this habit as completed? This will deactivate the habit but preserve your completion history.")) {
      setIsCompleting(id);
      await completeHabitAction(id);
      setIsCompleting(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this habit? This will also delete all completion history.")) {
      setIsDeleting(id);
      await deleteHabitAction(id);
      setIsDeleting(null);
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
      {habits.map((habit) => {
        const canBeCompleted = habit.stats.totalCompletions >= habit.target && !habit.completed;
        const motivationalMessage = getMotivationalMessage(
          habit.title,
          habit.stats,
          habit.target,
          habit.completed
        );

        return (
          <Card key={habit.id} className={cn(
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
                      {habit.completed && (
                        <Badge className="bg-green-600 hover:bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
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

                  {/* Frequency and Target */}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{habit.frequency.replaceAll("_", " ")}</span>
                    <span>•</span>
                    <span>Target: {habit.target}x</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 pt-1">
                  {/* Mark Complete Button */}
                  {canBeCompleted && (
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
