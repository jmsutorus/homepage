"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dumbbell, X } from "lucide-react";
import { HomePageButton } from "@/Shared/Components/Buttons/HomePageButton";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ActivityForm } from "./activity-form";
import { cn } from "@/lib/utils";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

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
    if (editActivity) {
      setIsModalOpen(false);
      onActivityAdded?.();
    } else {
      triggerSuccess();
    }
  };

  const handleDelete = () => {
    setIsModalOpen(false);
    onActivityDeleted?.();
  };

  const dialogHeader = (
    <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex justify-between items-start z-10 relative">
        <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
          {editActivity ? "Edit Workout Session" : "Log New Session"}
        </h2>
        <button 
          onClick={() => setIsModalOpen(false)}
          className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <p className="text-media-on-primary-container/80 text-sm max-w-sm z-10 relative font-medium leading-relaxed">
        {editActivity 
          ? "Update your progress metrics and session details to maintain accurate historical tracking."
          : "Document your physical output to establish performance benchmarks and visualize consistency."}
      </p>
      {/* Decorative blurred circle */}
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-media-secondary opacity-10 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
    </div>
  );

  const successContent = (
    <div className="flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
      <div className="relative">
        <SuccessCheck size={160} />
        <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight">Activity Logged</h3>
        <p className="text-media-on-surface-variant font-medium max-w-[240px]">
          Target metrics achieved. Your progress has been documented.
        </p>
      </div>
    </div>
  );

  const contentBody = (
    <div className={cn(
      "overflow-y-auto",
      isDesktop ? "px-10 py-8 max-h-[70vh]" : "flex-1 px-10 py-8"
    )}>
      {showSuccess ? successContent : (
        <ActivityForm 
          editActivity={editActivity} 
          onSuccess={handleSuccess} 
          onCancel={() => setIsModalOpen(false)} 
          onDelete={editActivity ? handleDelete : undefined}
          isDesktop={isDesktop}
        />
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {children ? (
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
        ) : (!editActivity && showButton && (
          <FloatingActionButton 
            onClick={() => setIsModalOpen(true)}
            tooltipText="Log Activity"
            icon={<Dumbbell className="h-8 w-8 text-media-on-secondary" />}
          />
        ))}
        <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-3xl overflow-hidden bg-media-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl">
          {dialogHeader}
          {contentBody}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile view
  return (
    <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
      {children ? (
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
      ) : (!editActivity && showButton && (
        <FloatingActionButton 
          onClick={() => setIsModalOpen(true)}
          tooltipText="Log Activity"
          icon={<Dumbbell className="h-8 w-8 text-media-on-secondary" />}
          className="md:hidden"
        />
      ))}
      <SheetContent 
        side="bottom" 
        className="h-[95vh] max-h-[95vh] p-0 border-none rounded-t-[40px] overflow-hidden bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {dialogHeader}
        {contentBody}
      </SheetContent>
    </Sheet>
  );
}
