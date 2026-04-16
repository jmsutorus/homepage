import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailCardProps {
  icon: ReactNode;
  name: string;
  value: string | number;
  measurement?: string;
  className?: string;
  iconBgClassName?: string;
  iconColorClassName?: string;
}

export function DetailCard({
  icon,
  name,
  value,
  measurement,
  className,
  iconBgClassName = "bg-evergreen/10",
  iconColorClassName = "text-evergreen"
}: DetailCardProps) {
  return (
    <div className={cn(
      "p-8 rounded-[1.5rem] shadow-sm border transition-all duration-300",
      "bg-white border-stone-200/50",
      "bg-card rounded-xl border border-border/60 hover:shadow-md",
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          iconBgClassName,
          "dark:bg-white/10",
          iconColorClassName,
          "dark:text-white"
        )}>
          {icon}
        </div>
        <span className={cn(
          "font-bold text-xs uppercase tracking-widest transition-colors text-soft-earth",
          "dark:text-white/60"
        )}>
          {name}
        </span>
      </div>
      <div className={cn(
        "text-4xl font-black tracking-tighter transition-colors text-evergreen-dark",
        "dark:text-white"
      )}>
        {value} {measurement && <span className={cn(
          "text-xl font-medium transition-colors text-soft-earth",
          "dark:text-white/40"
        )}>{measurement}</span>}
      </div>
    </div>
  );
}
