"use client";

import { useMemo } from "react";

interface SimpleMarkdownProps {
  content: string;
}

// Simple markdown to HTML converter
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md my-3 overflow-x-auto text-sm"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');

  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-3">');
  html = '<p class="mb-3">' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-3"><\/p>/g, '');

  return html;
}

export function SimpleMarkdown({ content }: SimpleMarkdownProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  if (!content) {
    return (
      <p className="text-muted-foreground italic">No content</p>
    );
  }

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
