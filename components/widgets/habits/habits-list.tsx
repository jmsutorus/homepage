"use client";

import { Habit } from "@/lib/db/habits";
import { updateHabitAction, deleteHabitAction } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HabitsListProps {
  habits: Habit[];
}

export function HabitsList({ habits }: HabitsListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleToggleActive = async (habit: Habit) => {
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
      {habits.map((habit) => (
        <Card key={habit.id} className={cn("transition-opacity", !habit.active && "opacity-60")}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="cursor-move text-muted-foreground">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <h3 className={cn("font-medium", !habit.active && "line-through")}>
                {habit.title}
              </h3>
              {habit.description && (
                <p className="text-sm text-muted-foreground">{habit.description}</p>
              )}
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                <span className="capitalize">{habit.frequency}</span>
                <span>•</span>
                <span>Target: {habit.target}x</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
