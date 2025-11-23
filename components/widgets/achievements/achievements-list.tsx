import { Achievement, ACHIEVEMENTS } from "@/lib/achievements";
import { AchievementBadge } from "./achievement-badge";

interface AchievementsListProps {
  userAchievements: Record<string, { unlocked: boolean; progress: number }>;
}

export function AchievementsList({ userAchievements }: AchievementsListProps) {
  // Group achievements by category
  const categories = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)));

  return (
    <div className="space-y-8">
      {categories.map(category => {
        const categoryAchievements = ACHIEVEMENTS
          .filter(a => a.category === category)
          .sort((a, b) => a.points - b.points);
        
        return (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
              {category} Achievements
              <span className="text-sm font-normal text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">
                {categoryAchievements.filter(a => userAchievements[a.id]?.unlocked).length} / {categoryAchievements.length}
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
