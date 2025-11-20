import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  color?: string; // Tailwind text color class for the icon/value
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  trend,
  color = "text-primary",
}: SummaryCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
          {title}
        </h3>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex flex-col gap-1">
        <div className={cn("text-2xl font-bold", color)}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
