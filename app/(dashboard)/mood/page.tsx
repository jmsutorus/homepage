import { MoodHeatmap } from "@/components/widgets/mood/mood-heatmap";

export const dynamic = "force-dynamic";

export default function MoodPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Track your daily mood with year-in-pixels visualization
        </p>
      </div>

      <MoodHeatmap year={currentYear} />
    </div>
  );
}
