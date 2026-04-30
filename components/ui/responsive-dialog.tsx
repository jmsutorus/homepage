"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import { useHaptic } from "@/hooks/use-haptic";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxHeight?: string;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
  // Built-in footer props
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  onDelete?: () => void;
}

/**
 * A responsive dialog component that renders as a Modal (Dialog) on desktop
 * and a Bottom Sheet on mobile. 
 * 
 * Includes mobile-optimized features like:
 * - Drag-to-dismiss handle
 * - Scroll tracking to prevent drag conflict
 * - Proper safe area handling
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxHeight = "90vh",
  maxWidth = "sm:max-w-5xl",
  className,
  showCloseButton = true,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  isLoading = false,
  loadingText = "Loading...",
  onDelete,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isAtTop, setIsAtTop] = useState(true);
  const haptic = useHaptic();

  const handleAction = (callback?: () => void, pattern: "light" | "medium" | "heavy" = "medium") => {
    haptic.trigger(pattern);
    callback?.();
  };

  const renderFooter = () => {
    return (
      <div className={cn(
        "flex items-center shrink-0 w-full",
        isDesktop 
          ? "justify-between pt-10 border-t border-media-outline-variant/10" 
          : "flex-col-reverse gap-4 pt-6"
      )}>
        {onDelete ? (
          <button 
            type="button"
            onClick={() => handleAction(onDelete, "heavy")}
            className={cn(
              "cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all flex items-center justify-center rounded-xl",
              isDesktop ? "p-3" : "py-4 w-full"
            )}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          isDesktop && <div />
        )}

        <div className={cn(
          "flex items-center",
          isDesktop ? "gap-10" : "flex-col-reverse gap-4 w-full"
        )}>
          <button 
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "cursor-pointer font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-all font-lexend flex items-center justify-center",
              isDesktop ? "text-sm px-10 py-5 hover:bg-media-primary/5 rounded-2xl" : "text-xs py-2"
            )}
          >
            {cancelText}
          </button>
          <button 
            type={onSubmit ? "button" : "submit"}
            disabled={isLoading}
            onClick={() => handleAction(onSubmit, "medium")}
            className={cn(
              "cursor-pointer bg-media-secondary text-media-on-secondary rounded-2xl font-bold tracking-tight transition-all font-lexend uppercase flex items-center justify-center gap-3",
              isDesktop 
                ? "px-10 py-5 text-sm shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100" 
                : "w-full h-16 text-sm active:scale-95"
            )}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                {loadingText}
              </>
            ) : (
              submitText
            )}
          </button>
        </div>
      </div>
    );
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          showCloseButton={false} 
          className={cn(
            "p-0 border-none rounded-3xl shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] flex flex-col overflow-hidden bg-media-surface-container-lowest font-lexend",
            maxWidth,
            className
          )}
          style={{ maxHeight }}
        >
          {/* Premium Desktop Header */}
          <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
            <div className="flex justify-between items-start z-10 relative">
              <DialogTitle asChild>
                <h1 className="text-5xl font-bold tracking-tighter text-media-on-primary dark:text-media-on-primary-container font-lexend uppercase">
                  {title}
                </h1>
              </DialogTitle>
              {showCloseButton && (
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
            {description && (
              <DialogDescription asChild>
                <p className="text-media-on-primary dark:text-media-on-primary-container text-sm max-w-md z-10 relative font-medium leading-relaxed">
                  {description}
                </p>
              </DialogDescription>
            )}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
          </div>

          {/* Content Area */}
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12" 
            onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
          >
            {children}
            
            {/* Integrated Footer */}
            {renderFooter()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90dvh] max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className="flex flex-col h-full bg-media-surface-container-lowest"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Mobile Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full font-lexend overflow-hidden">
            {/* Mobile Header */}
            <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10 shrink-0">
              <SheetTitle className="text-4xl font-bold text-media-primary tracking-tighter text-left uppercase">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-left text-media-on-surface-variant font-medium">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>

            {/* Mobile Content Area */}
            <div 
              className="flex-1 overflow-y-auto px-6 py-6" 
              onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
            >
              {children}
            </div>

            {/* Mobile Footer */}
            <div className="p-6 bg-media-surface-container-low dark:bg-media-surface border-t border-media-outline-variant/30 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shrink-0">
              {renderFooter()}
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
