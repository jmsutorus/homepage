import Link from "next/link";
import { JournalContent } from "@/lib/db/journals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";

interface DailyJournalPreviewProps {
  journal: JournalContent;
}

export function DailyJournalPreview({ journal }: DailyJournalPreviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Daily Entry
        </CardTitle>
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 cursor-pointer">
          <Link href={`/journals/${journal.slug}/edit`}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Journal</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-6">
          <MDXRemote source={journal.content} />
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="link" size="sm" asChild className="px-0">
            <Link href={`/journals/${journal.slug}`}>
              Read full entry
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
