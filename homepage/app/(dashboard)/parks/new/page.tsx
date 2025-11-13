import { ParkEditor } from '@/components/widgets/park-editor';

export default function NewParkPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Park</h1>
        <p className="text-muted-foreground">
          Create a new entry for a park you've visited or want to visit.
        </p>
      </div>

      <ParkEditor mode="create" />
    </div>
  );
}
