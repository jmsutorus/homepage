"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dumbbell, X } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ActivityForm } from "./activity-form";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { motion, PanInfo } from "framer-motion";

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
  const [isAtTop, setIsAtTop] = useState(true);

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
    <div className="flex-none bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex justify-between items-start z-10 relative">
        <DialogTitle className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
          {editActivity ? "Edit Workout Session" : "Log New Session"}
        </DialogTitle>
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
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center py-20 px-10 animate-in fade-in slide-in-from-bottom-8">
      <TreeSuccess size={200} showText={false} />
    </div>
  );

  const contentBody = (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {showSuccess ? successContent : (
        <ActivityForm 
          key={editActivity?.id || "new"}
          editActivity={editActivity} 
          onSuccess={handleSuccess} 
          onCancel={() => setIsModalOpen(false)} 
          onDelete={editActivity ? handleDelete : undefined}
          isDesktop={isDesktop}
          onScrollTopChange={setIsAtTop}
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
        <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-3xl overflow-hidden bg-media-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl flex flex-col max-h-[90vh]">
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
        className="h-[90dvh] max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className="flex flex-col h-full font-lexend bg-media-surface-container-lowest"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              setIsModalOpen(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
            <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight">
              {editActivity ? "Refine Protocol" : "Establish Protocol"}
            </SheetTitle>
          </SheetHeader>
          {contentBody}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
