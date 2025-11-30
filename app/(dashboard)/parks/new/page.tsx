import { ParkEditor } from '@/components/widgets/parks/park-editor';

export const dynamic = "force-dynamic";

export default function NewParkPage() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-5xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Add New Park</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Create a new entry for a park you&apos;ve visited or want to visit.
        </p>
      </div>

      <ParkEditor mode="create" />
    </div>
  );
}
