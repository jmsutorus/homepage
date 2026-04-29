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
  const progressPercent = ACHIEVEMENTS.length > 0 ? (totalUnlocked / ACHIEVEMENTS.length) : 0;
  
  // Calculate stroke dashoffset for a circle with r=28 (circumference = 2 * PI * 28 ≈ 175.9)
  const circleCircumference = 175.9;
  const strokeDashoffset = circleCircumference - (progressPercent * circleCircumference);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center w-full pb-12 md:pb-20">
      <section className="text-center mb-20 w-full">
        <span className="text-sm uppercase tracking-[0.2em] text-media-secondary font-semibold mb-4 block font-label">Legacy & Mastery</span>
        <h2 className="text-5xl md:text-7xl font-bold text-media-primary tracking-tight leading-[0.95] mb-6 font-headline">Your Personal Archive.</h2>
        <p className="text-media-on-surface-variant text-lg max-w-2xl mx-auto mb-12 font-body">Every thought captured, every habit formed, every book finished—meticulously curated for your growth.</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
          <div className="bg-media-surface-container-low p-6 rounded-xl flex items-center gap-8 flex-1 justify-center">
            <div className="text-left">
              <div className="text-3xl font-bold text-media-primary font-headline">{totalUnlocked} / {ACHIEVEMENTS.length}</div>
              <div className="text-sm font-label uppercase tracking-widest text-media-on-surface-variant opacity-70 mt-1">Unlocked Milestones</div>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-media-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                <circle className="text-media-secondary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="6" style={{ transition: "stroke-dashoffset 1s ease-in-out" }}></circle>
              </svg>
              <span className="absolute text-[10px] font-bold font-label text-media-primary">{Math.round(progressPercent * 100)}%</span>
            </div>
          </div>
          <div className="bg-media-primary-container text-media-on-primary-container p-6 rounded-xl flex items-center gap-8 flex-1 justify-center">
            <div className="text-left">
              <div className="text-3xl font-bold font-headline">{totalPoints}</div>
              <div className="text-sm font-label uppercase tracking-widest text-media-on-primary-container/70 mt-1">Curator Points</div>
            </div>
            <Trophy className="w-10 h-10 text-media-secondary" strokeWidth={1.5} />
          </div>
        </div>
      </section>

      <div className="w-full space-y-24">
        <AchievementsList userAchievements={userAchievements} />
      </div>
    </div>
  );
}
