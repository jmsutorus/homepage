"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      richColors={false}
      icons={{
        success: (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-media-secondary/10 mr-4">
            <span className="material-symbols-outlined text-media-secondary text-xl font-bold">check</span>
          </div>
        ),
        error: (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-media-error/10 mr-4">
            <span className="material-symbols-outlined text-media-error text-xl font-bold">error</span>
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-media-surface-container-low group-[.toaster]:text-media-primary-container group-[.toaster]:border-media-primary-container group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg group-[.toaster]:px-6 group-[.toaster]:py-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4 font-lexend",
          title: "font-lexend font-semibold text-sm tracking-tight",
          description: "font-lexend text-xs opacity-70",
          actionButton:
            "group-[.toast]:bg-media-primary group-[.toast]:text-media-on-primary font-lexend",
          cancelButton:
            "group-[.toast]:bg-media-surface-container-highest group-[.toast]:text-media-on-surface-variant font-lexend",
          closeButton: "hover:text-media-primary-container text-media-primary-container/40 transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
