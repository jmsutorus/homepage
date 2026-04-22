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
  Dumbbell,
  Languages,
  Heart,
  Sparkles,
  Calendar,
  Star,
  Plane,
  Luggage,
  CalendarCheck,
  PiggyBank,
  Wallet,
  Compass,
  Globe,
  MapPin,
  Activity,
  CalendarClock,
  PlaneTakeoff,
  Lock,
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
  'dumbbell': Dumbbell,
  'languages': Languages,
  'heart': Heart,
  'sparkles': Sparkles,
  'calendar': Calendar,
  'star': Star,
  'plane': Plane,
  'luggage': Luggage,
  'calendar-check': CalendarCheck,
  'piggy-bank': PiggyBank,
  'wallet': Wallet,
  'compass': Compass,
  'globe': Globe,
  'map-pin': MapPin,
  'activity': Activity,
  'calendar-clock': CalendarClock,
  'plane-takeoff': PlaneTakeoff,
};

export function AchievementBadge({ achievement, unlocked, progress, className }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const currentProgress = Math.min(progress, achievement.target_value);
  const percent = Math.min(100, Math.round((currentProgress / achievement.target_value) * 100));

  if (unlocked) {
    return (
      <div className={cn("bg-media-surface-container-lowest p-6 rounded-xl border border-media-outline-variant/10 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-secondary/30 transition-all", className)}>
        <div className="w-16 h-16 flex-shrink-0 bg-media-surface-container-high rounded-lg flex items-center justify-center text-media-primary group-hover:bg-media-secondary group-hover:text-white transition-colors">
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-grow">
          <h4 className="text-xl font-bold mb-1 font-headline">{achievement.title}</h4>
          <p className="text-media-on-surface-variant text-sm font-body">{achievement.description}</p>
        </div>
        <div className="flex flex-col items-end min-w-[120px] ml-auto mt-4 md:mt-0">
          <span className="text-[10px] font-bold text-media-secondary uppercase tracking-widest mb-1 font-label">Unlocked</span>
          <CheckCircle2 className="text-media-surface-container-lowest w-6 h-6 fill-media-secondary" />
        </div>
      </div>
    );
  }

  if (progress > 0) {
    // For high point target achievements in progress, use the emphasized bg-media-primary card
    if (achievement.points >= 40) {
      return (
        <div className={cn("bg-media-primary text-white p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden", className)}>
          <div className="absolute right-4 bottom-0 opacity-5 pointer-events-none hidden md:block">
            <Icon className="w-[80px] h-[80px]" />
          </div>
          <div className="w-16 h-16 flex-shrink-0 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-white">
            <Icon className="w-8 h-8 text-media-secondary" />
          </div>
          <div className="flex-grow relative z-10">
            <h4 className="text-xl font-bold mb-1 font-headline">{achievement.title}</h4>
            <p className="text-white/70 text-sm font-body">{achievement.description}</p>
          </div>
          <div className="w-full md:w-32 flex flex-col items-end min-w-[120px] ml-auto mt-4 md:mt-0 relative z-10">
            <span className="text-[10px] font-bold text-media-secondary uppercase tracking-widest mb-1 font-label">{currentProgress} / {achievement.target_value} Complete</span>
            <Lock className="text-white/30 w-6 h-6" />
          </div>
        </div>
      );
    }
    
    // Normal progress
    return (
      <div className={cn("bg-media-surface-container-lowest p-6 rounded-xl border border-media-outline-variant/10 flex flex-col md:flex-row items-start md:items-center gap-6", className)}>
        <div className="w-16 h-16 flex-shrink-0 bg-media-surface-container-high rounded-lg flex items-center justify-center text-media-primary">
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-grow">
          <h4 className="text-xl font-bold mb-1 font-headline">{achievement.title}</h4>
          <p className="text-media-on-surface-variant text-sm font-body">{achievement.description}</p>
        </div>
        <div className="w-full md:w-48 flex flex-col gap-2 ml-auto mt-4 md:mt-0">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-media-on-surface-variant font-label">Progress</span>
            <span className="text-[10px] font-bold text-media-primary font-label">{currentProgress} / {achievement.target_value}</span>
          </div>
          <div className="h-1.5 bg-media-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-media-primary" style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Locked (0 progress)
  return (
    <div className={cn("bg-media-surface-container-low rounded-xl border border-media-outline-variant/5 flex flex-col md:flex-row items-start md:items-center p-6 gap-6 opacity-60 grayscale", className)}>
      <div className="w-16 h-16 flex-shrink-0 bg-media-surface-container-high rounded-lg flex items-center justify-center text-media-on-surface-variant">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-grow">
        <h4 className="text-xl font-bold mb-1 font-headline text-media-on-surface">{achievement.title}</h4>
        <p className="text-media-on-surface-variant text-sm font-body">{achievement.description}</p>
      </div>
      <div className="flex flex-col items-end min-w-[120px] ml-auto mt-4 md:mt-0">
        <span className="text-[10px] font-bold text-media-on-surface-variant uppercase tracking-widest font-label">Locked</span>
      </div>
    </div>
  );
}
