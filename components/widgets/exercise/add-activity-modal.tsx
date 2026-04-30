"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Dumbbell } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { ActivityForm } from "./activity-form";

interface AddActivityModalProps {
  onActivityAdded?: () => void;
  onActivityDeleted?: () => void;
  editActivity?: WorkoutActivity | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showButton?: boolean;
  children?: React.ReactNode;
}

export function AddActivityModal({ 
  onActivityAdded, 
  onActivityDeleted, 
  editActivity, 
  isOpen, 
  onOpenChange, 
  showButton,
  children 
}: AddActivityModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled open state if provided
  const isModalOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setIsModalOpen = onOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setIsModalOpen(false);
    onActivityAdded?.();
  };

  const handleDelete = () => {
    setIsModalOpen(false);
    onActivityDeleted?.();
  };

  const contentBody = (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <ActivityForm 
        key={editActivity?.id || "new"}
        editActivity={editActivity} 
        onSuccess={handleSuccess} 
        onCancel={() => setIsModalOpen(false)} 
        onDelete={editActivity ? handleDelete : undefined}
      />
    </div>
  );

  return (
    <>
      {children ? (
        <div onClick={() => setIsModalOpen(true)} className="contents">
          {children}
        </div>
      ) : (!editActivity && showButton && (
        <FloatingActionButton 
          onClick={() => setIsModalOpen(true)}
          tooltipText="Log Activity"
          icon={<Dumbbell className="h-8 w-8 text-media-on-secondary" />}
        />
      ))}

      <ResponsiveDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editActivity ? "Edit Workout Session" : "Log New Session"}
        description={editActivity 
          ? "Update your progress metrics and session details."
          : "Document your physical output to establish performance benchmarks."}
        maxWidth="sm:max-w-4xl"
        onSubmit={() => document.getElementById("submit-activity")?.click()}
        submitText={editActivity ? "Update Session" : "Log Session"}
        onDelete={editActivity ? () => document.getElementById("delete-activity")?.click() : undefined}
      >
        {contentBody}
      </ResponsiveDialog>
    </>
  );
}
