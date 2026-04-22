import * as React from "react"
import { Plus } from "lucide-react"
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
          "cursor-pointer fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-16 h-16 bg-media-secondary text-media-on-secondary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group",
          className
        )}
        {...props}
      >
        {icon || <Plus className="h-8 w-8 text-media-on-secondary" />}
        <span className="absolute right-20 bg-media-primary text-media-on-primary px-4 py-2 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          {tooltipText}
        </span>
      </button>
    )
  }
)

FloatingActionButton.displayName = "FloatingActionButton"
