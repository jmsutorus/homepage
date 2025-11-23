import { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { 
  Sunrise, 
  Flame, 
  Zap, 
  BookOpen, 
  Film, 
  Repeat, 
  CheckCircle2, 
  ListChecks, 
  Mountain, 
  PenTool,
  Trophy,
  LucideIcon
} from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'sunrise': Sunrise,
  'flame': Flame,
  'zap': Zap,
  'book-open': BookOpen,
  'film': Film,
  'repeat': Repeat,
  'check-circle-2': CheckCircle2,
  'list-checks': ListChecks,
  'mountain': Mountain,
  'pen-tool': PenTool,
};

export function AchievementBadge({ achievement, unlocked, progress, className }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const percent = Math.min(100, Math.round((progress / achievement.target_value) * 100));

  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-xl border transition-all duration-300",
      unlocked 
        ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 shadow-sm" 
        : "bg-muted/30 border-muted grayscale opacity-80",
      className
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner",
        unlocked ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : "bg-muted text-muted-foreground"
      )}>
        <Icon size={32} />
      </div>
      
      <h3 className="font-bold text-center text-sm mb-1 line-clamp-1" title={achievement.title}>
        {achievement.title}
      </h3>
      
      <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2 h-8" title={achievement.description}>
        {achievement.description}
      </p>

      <div className="w-full mt-auto">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>{unlocked ? "Unlocked" : "Progress"}</span>
          <span>{progress} / {achievement.target_value}</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", unlocked ? "bg-yellow-500" : "bg-primary/50")} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
