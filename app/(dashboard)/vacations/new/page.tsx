import { VacationEditor } from "@/components/widgets/vacations/vacation-editor";

export default function NewVacationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plan a New Vacation</h1>
        <p className="text-muted-foreground">
          Create a new vacation and plan your itinerary
        </p>
      </div>

      <VacationEditor mode="create" />
    </div>
  );
}
