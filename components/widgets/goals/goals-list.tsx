"use client";

import { GoalCard } from "./goal-card";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import type { Goal } from "@/lib/db/goals";

interface GoalsListProps {
  goals: (Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  })[];
}

export function GoalsList({ goals }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/10">
        <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No goals found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first goal to start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <GoalCard goal={goal} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
