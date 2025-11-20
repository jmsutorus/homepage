"use client";

import { HabitWithStats } from "@/lib/actions/habits";
import { updateHabitAction, deleteHabitAction } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical, Flame, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HabitsListProps {
  habits: HabitWithStats[];
}

// Generate catchy motivational message based on stats
function getMotivationalMessage(title: string, stats: HabitWithStats['stats']): string {
  const { currentStreak, daysExisted, totalCompletions } = stats;

  if (currentStreak === 0) {
    if (totalCompletions === 0) {
      return `Ready to start your ${title.toLowerCase()} journey? Today's the day!`;
    }
    return `Time to get back on track with ${title.toLowerCase()}!`;
  }

  if (currentStreak === 1) {
    return `You've done ${title.toLowerCase()} today. Great start! 🌟`;
  }

  if (currentStreak === 2) {
    return `Two days in a row! You're building momentum! 🚀`;
  }

  if (currentStreak >= 3 && currentStreak < 7) {
    return `${currentStreak} days strong! Keep the fire burning! 🔥`;
  }

  if (currentStreak >= 7 && currentStreak < 14) {
    return `${currentStreak} days in a row! You're on a roll! 💪`;
  }

  if (currentStreak >= 14 && currentStreak < 30) {
    return `${currentStreak} days straight! This is becoming a habit! ⭐`;
  }

  if (currentStreak >= 30 && currentStreak < 60) {
    return `${currentStreak} days! You're unstoppable! 🎯`;
  }

  if (currentStreak >= 60 && currentStreak < 100) {
    return `${currentStreak} days! Absolutely crushing it! 🏆`;
  }

  if (currentStreak >= 100) {
    return `${currentStreak} days! Legendary status achieved! 👑`;
  }

  return `${currentStreak} days in a row! Keep going!`;
}

export function HabitsList({ habits }: HabitsListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleToggleActive = async (habit: HabitWithStats) => {
    await updateHabitAction(habit.id, { active: !habit.active });
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
        const motivationalMessage = getMotivationalMessage(habit.title, habit.stats);

        return (
          <Card key={habit.id} className={cn("transition-opacity", !habit.active && "opacity-60")}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="cursor-move text-muted-foreground pt-1">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-3">
                  {/* Title and Description */}
                  <div>
                    <h3 className={cn("font-medium text-lg", !habit.active && "line-through")}>
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    )}
                  </div>

                  {/* Motivational Message */}
                  <div className="text-sm font-medium text-primary bg-primary/5 px-3 py-2 rounded-md border border-primary/20">
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

                <div className="flex items-start gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Switch
                      checked={habit.active}
                      onCheckedChange={() => handleToggleActive(habit)}
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
