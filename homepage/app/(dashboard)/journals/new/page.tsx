import { JournalEditor } from '@/components/widgets/journal-editor';

export default function NewJournalPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Journal Entry</h1>
        <p className="text-muted-foreground">
          Create a new journal entry to document your thoughts and experiences.
        </p>
      </div>

      <JournalEditor mode="create" />
    </div>
  );
}
