'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

interface MediaFrontmatter {
  title: string;
  type: 'movie' | 'tv' | 'book' | 'game';
  status: 'in-progress' | 'completed' | 'planned';
  rating?: number;
  started?: string;
  completed?: string;
  released?: string;
  genres?: string[];
  poster?: string;
  tags?: string[];
  length?: string;
  featured?: boolean;
  published?: boolean;
}

interface MarkdownPreviewProps {
  frontmatter: MediaFrontmatter;
  content: string;
}

// Simple markdown to HTML converter for preview
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li[\s\S]*<\/li>)/g, '<ul class="list-disc my-4">$1</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = '<p class="mb-4">' + html + '</p>';

  return html;
}

export function MarkdownPreview({ frontmatter, content }: MarkdownPreviewProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  const statusColors: Record<string, string> = {
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    planned: 'bg-gray-500',
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-600'}>
        ★
      </span>
    ));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header with metadata */}
        <div className="space-y-4 mb-8 pb-6 border-b">
          {frontmatter.poster && (
            <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-muted">
              <img
                src={frontmatter.poster}
                alt={frontmatter.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-4xl font-bold">{frontmatter.title || 'Untitled'}</h1>

            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="outline" className="capitalize">
                {frontmatter.type}
              </Badge>

              <Badge className={statusColors[frontmatter.status]}>
                {frontmatter.status === 'in-progress'
                  ? frontmatter.type === 'book' ? 'Reading' : frontmatter.type === 'tv' ? 'Watching' : 'In Progress'
                  : frontmatter.status.charAt(0).toUpperCase() + frontmatter.status.slice(1)}
              </Badge>

              {frontmatter.rating && (
                <div className="flex items-center gap-1 text-lg">
                  {renderStars(frontmatter.rating)}
                </div>
              )}

              {frontmatter.completed && (
                <span className="text-sm text-muted-foreground">
                  Completed: {new Date(frontmatter.completed).toLocaleDateString()}
                </span>
              )}

              {frontmatter.started && (
                <span className="text-sm text-muted-foreground">
                  Started: {new Date(frontmatter.started).toLocaleDateString()}
                </span>
              )}
            </div>

            {frontmatter.genres && frontmatter.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {frontmatter.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Markdown content */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {!content && (
          <p className="text-muted-foreground text-center py-8">
            No content yet. Switch to the Edit tab to write something.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
