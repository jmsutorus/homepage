"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ActivityForm } from "./activity-form";
import { cn } from "@/lib/utils";

interface AddActivityModalProps {
  onActivityAdded?: () => void;
  editActivity?: WorkoutActivity | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showButton?: boolean;
}

export function AddActivityModal({ onActivityAdded, editActivity, isOpen, onOpenChange, showButton }: AddActivityModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Use controlled open state if provided
  const isModalOpen = isOpen !== undefined ? isOpen : open;
  const setIsModalOpen = onOpenChange || setOpen;

  // Success dialog state
  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      setIsModalOpen(false);
      onActivityAdded?.();
    },
  });

  // Reset success state when dialog opens
  useEffect(() => {
    if (isModalOpen) {
      resetSuccess();
    }
  }, [isModalOpen, resetSuccess]);

  const handleSuccess = () => {
    // If editing, just close and refresh without animation
    if (editActivity) {
      setIsModalOpen(false);
      onActivityAdded?.();
    } else {
      // If adding, show success animation
      triggerSuccess();
    }
  };

  const dialogContent = (
    <>
      <div className={cn(isDesktop ? "px-6 pt-6" : "")}>
        {isDesktop ? (
            <DialogHeader>
            <DialogTitle>{editActivity ? "Edit Workout Activity" : "Add Workout Activity"}</DialogTitle>
            <DialogDescription>
                {editActivity ? "Update your workout activity details" : "Create a new workout activity with exercises and details"}
            </DialogDescription>
            </DialogHeader>
        ) : (
            <SheetHeader className="px-6 pt-6 pb-4 border-b text-left">
            <SheetTitle>{editActivity ? "Edit Workout Activity" : "Add Workout Activity"}</SheetTitle>
            <SheetDescription className="hidden">
                 {/* Hidden description for accessibility but visual design matches task sheet */}
                {editActivity ? "Update details" : "Create new"}
            </SheetDescription>
            </SheetHeader>
        )}
      </div>

      <div className={cn(isDesktop ? "px-6 py-4 overflow-y-auto max-h-[80vh]" : "flex-1 min-h-0")}>
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <SuccessCheck size={120} />
            <h3 className="text-2xl font-semibold text-green-500">Activity Logged!</h3>
            <p className="text-muted-foreground text-center">
              Keep up the momentum!
            </p>
          </div>
        ) : (
          <ActivityForm 
            editActivity={editActivity} 
            onSuccess={handleSuccess} 
            onCancel={() => setIsModalOpen(false)} 
            isDesktop={isDesktop}
          />
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {!editActivity && showButton && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          {dialogContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile view
  return (
    <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
      {/* FAB for Mobile - rendered via Portal or just fixed if showButton is true */}
      {!editActivity && showButton && (
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 md:hidden"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Activity</span>
          </Button>
        </SheetTrigger>
      )}
      <SheetContent 
        side="bottom" 
        className="h-[90vh] max-h-[90vh] p-0 rounded-t-3xl flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {dialogContent}
      </SheetContent>
    </Sheet>
  );
}
