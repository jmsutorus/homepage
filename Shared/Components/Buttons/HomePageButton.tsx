import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface HomePageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  children: React.ReactNode;
  asChild?: boolean;
}

export const HomePageButton = React.forwardRef<HTMLButtonElement, HomePageButtonProps>(
  ({ className, variant = "primary", icon, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "px-5 py-2.5 rounded-xl font-black text-base flex items-center gap-2 transition-all shadow-lg cursor-pointer",
          variant === "primary" && "bg-burnt-terracotta text-white",
          variant === "secondary" && "bg-surface-container-high text-on-surface shadow-sm",
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

HomePageButton.displayName = "HomePageButton";
