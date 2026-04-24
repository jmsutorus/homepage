import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltipText: string;
  icon?: React.ReactNode;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, tooltipText, icon, ...props }, ref) => {
    return (
      <button 
        ref={ref}
        className={cn(
          "cursor-pointer fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-16 h-16 bg-media-secondary text-media-on-secondary rounded-2xl flex items-center justify-center shadow-2xl shadow-media-secondary/30 hover:scale-110 active:scale-95 transition-all z-40 group hover:bg-media-secondary/90",
          className
        )}
        {...props}
      >
        {icon || <span className="material-symbols-outlined text-3xl font-bold">add</span>}
        <span className="absolute right-[calc(100%+1.5rem)] bg-media-primary text-media-on-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 pointer-events-none shadow-2xl border border-media-outline-variant/10">
          {tooltipText}
        </span>
      </button>
    )
  }
)

FloatingActionButton.displayName = "FloatingActionButton"
