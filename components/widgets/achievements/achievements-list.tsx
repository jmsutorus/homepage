import { ACHIEVEMENTS } from "@/lib/achievements";
import { AchievementBadge } from "./achievement-badge";

interface AchievementsListProps {
  userAchievements: Record<string, { unlocked: boolean; progress: number }>;
}

export function AchievementsList({ userAchievements }: AchievementsListProps) {
  // Group achievements by category
  const categories = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)));

  return (
    <div className="w-full space-y-24">
      {categories.map((category, index) => {
        const categoryAchievements = ACHIEVEMENTS
          .filter(a => a.category === category)
          .sort((a, b) => a.points - b.points);
        
        return (
          <div key={category} className="w-full">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-3xl font-bold text-media-primary tracking-tight whitespace-nowrap capitalize font-headline">
                {category}
              </h3>
              <div className="h-[1px] flex-grow bg-outline-variant opacity-30"></div>
              <span className="text-media-on-surface-variant font-label text-sm uppercase tracking-widest whitespace-nowrap">
                Category {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {categoryAchievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={userAchievements[achievement.id]?.unlocked || false}
                  progress={userAchievements[achievement.id]?.progress || 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
