import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/server";
import { getUserAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { AchievementsList } from "@/components/widgets/achievements/achievements-list";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Achievements | Homepage",
  description: "Track your progress and achievements.",
};

export default async function AchievementsPage() {
  const session = await requireAuth();

  const userAchievements = await getUserAchievements(session.user.id);
  
  // Calculate total stats
  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => {
    return sum + (userAchievements[a.id]?.unlocked ? a.points : 0);
  }, 0);
  
  const totalUnlocked = Object.values(userAchievements).filter(a => a.unlocked).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your milestones and earn badges.
          </p>
        </div>
        
        <div className="flex gap-6 bg-muted/50 p-4 rounded-xl border">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalUnlocked} / {ACHIEVEMENTS.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Unlocked</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{totalPoints}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Points</div>
          </div>
        </div>
      </div>

      <AchievementsList userAchievements={userAchievements} />
    </div>
  );
}
