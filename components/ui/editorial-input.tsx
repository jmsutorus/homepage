import * as React from "react"
import { cn } from "@/lib/utils"

export interface EditorialInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  sizeVariant?: "lg" | "xl";
  leftIcon?: React.ReactNode;
}

const EditorialInput = React.forwardRef<HTMLInputElement, EditorialInputProps>(
  ({ className, type, label, containerClassName, sizeVariant = "xl", leftIcon, ...props }, ref) => {
    return (
      <div className={cn("space-y-3", containerClassName)}>
        {label && (
          <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-media-on-surface-variant/40 group-focus-within:text-media-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl outline-none focus:outline-none focus:border-media-secondary focus:bg-media-surface-container-high transition-[background-color,border-color,color,transform,box-shadow] text-media-primary font-lexend placeholder:text-media-on-surface-variant/20",
              leftIcon && "pl-16",
              sizeVariant === "xl" ? "text-2xl font-bold" : "text-lg font-medium",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    )
  }
)
EditorialInput.displayName = "EditorialInput"

export interface EditorialTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  sizeVariant?: "lg" | "xl";
}

const EditorialTextarea = React.forwardRef<HTMLTextAreaElement, EditorialTextareaProps>(
  ({ className, label, containerClassName, sizeVariant = "lg", ...props }, ref) => {
    return (
      <div className={cn("space-y-3", containerClassName)}>
        {label && (
          <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              "w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl outline-none focus:outline-none focus:border-media-secondary focus:bg-media-surface-container-high transition-[background-color,border-color,color,transform,box-shadow] text-media-primary font-lexend placeholder:text-media-on-surface-variant/20 resize-none",
              sizeVariant === "xl" ? "text-2xl font-bold" : "text-lg font-medium",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    )
  }
)
EditorialTextarea.displayName = "EditorialTextarea"


export { EditorialInput, EditorialTextarea }
