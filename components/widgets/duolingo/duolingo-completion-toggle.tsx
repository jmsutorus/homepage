"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Circle, Languages } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleDuolingoLessonCompletion } from "@/lib/actions/settings";

interface DuolingoCompletionToggleProps {
  date: string;
  isCompleted: boolean;
}

export function DuolingoCompletionToggle({ date, isCompleted }: DuolingoCompletionToggleProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleDuolingoLessonCompletion(date);
      if (result.success && result.completed !== undefined) {
        setCompleted(result.completed);
      }
    });
  };

  return (
    <Card className={completed ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${completed ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
              <Languages className={`h-5 w-5 ${completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-medium text-sm">Duolingo Lesson</h3>
              <p className="text-xs text-muted-foreground">
                {completed ? "Completed" : "Not completed yet"}
              </p>
            </div>
          </div>
          
          <Button
            variant={completed ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={completed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            {isPending ? (
              <Circle className="h-4 w-4 animate-pulse" />
            ) : completed ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                
              </>
            ) : (
              "Mark Done"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
