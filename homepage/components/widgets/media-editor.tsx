'use client';

import { useState, useRef, FormEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownPreview } from './markdown-preview';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  description?: string;
  length?: string;
  featured?: boolean;
  published?: boolean;
}

interface MediaEditorProps {
  initialFrontmatter?: MediaFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingType?: string;
  existingSlug?: string;
}

interface ImportResult {
  filename: string;
  status: 'success' | 'failed' | 'bad-frontmatter';
  error?: string;
  slug?: string;
  path?: string;
}

const GENRE_OPTIONS = [
  'action', 'adventure', 'animation', 'comedy', 'crime', 'documentary',
  'drama', 'fantasy', 'horror', 'mystery', 'romance', 'sci-fi', 'thriller',
  'western', 'biography', 'history', 'music', 'sport', 'war', 'RPG', 'FPS',
  'strategy', 'puzzle', 'platformer', 'simulation', 'racing', 'fighting'
];

export function MediaEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingType,
  existingSlug,
}: MediaEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [frontmatter, setFrontmatter] = useState<MediaFrontmatter>(
    initialFrontmatter || {
      title: '',
      type: 'movie',
      status: 'planned',
      genres: [],
      tags: [],
      featured: false,
      published: true,
    }
  );
  const [content, setContent] = useState(initialContent);
  const [genreInput, setGenreInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Helper function to convert ISO date to YYYY-MM-DD format
  const normalizeDate = (dateString: string): string => {
    try {
      // Check if it's an ISO format with timestamp (e.g., 2024-11-25T00:00:00.000Z)
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      // Already in YYYY-MM-DD format or other simple format
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Helper function to remove Obsidian wiki-link syntax
  const removeObsidianSyntax = (text: string): string => {
    // Remove [[link]] or [[link|alias]] wiki-links
    // For [[link|alias]], keep only the alias
    // For [[link]], keep only the link text
    return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, alias) => {
      // If there's an alias, use it; otherwise use the link text
      return alias || link;
    });
  };

  // Parse markdown file with frontmatter
  const parseMarkdownFile = (fileContent: string) => {
    try {
      // Check if file has frontmatter (starts with ---)
      const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
      const match = fileContent.match(frontmatterRegex);

      if (!match) {
        // No frontmatter, treat entire content as markdown
        const cleanedContent = removeObsidianSyntax(fileContent);
        setContent(cleanedContent);
        setUploadMessage('File imported (no frontmatter found)');
        return;
      }

      const [, frontmatterStr, contentStr] = match;
      const parsedFrontmatter: Partial<MediaFrontmatter> = {};

      // Parse YAML frontmatter
      const lines = frontmatterStr.split('\n');
      let currentArrayKey: string | null = null;
      let currentArray: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is an array item (starts with -)
        if (line.trim().startsWith('-')) {
          const item = line.trim().substring(1).trim();
          // Remove quotes if present
          let cleanItem = item.replace(/^["']|["']$/g, '');
          // Remove Obsidian wiki-link syntax
          cleanItem = removeObsidianSyntax(cleanItem);
          currentArray.push(cleanItem);
          continue;
        }

        // If we were collecting an array and hit a non-array line, save it
        if (currentArrayKey && currentArray.length > 0) {
          const key = currentArrayKey.toLowerCase();
          if (key === 'genres' || key === 'genre') {
            parsedFrontmatter.genres = currentArray;
          } else if (key === 'tags' || key === 'tag') {
            parsedFrontmatter.tags = currentArray;
          }
          currentArrayKey = null;
          currentArray = [];
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim().toLowerCase(); // Make case-insensitive
        let value = line.substring(colonIndex + 1).trim();

        // If value is empty, this might be the start of an array
        if (!value) {
          if (key === 'genres' || key === 'genre' || key === 'tags' || key === 'tag') {
            currentArrayKey = key;
            currentArray = [];
          }
          continue;
        }

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Remove Obsidian wiki-link syntax from value
        value = removeObsidianSyntax(value);

        // Parse inline arrays (format: [item1, item2])
        if (value.startsWith('[') && value.endsWith(']')) {
          const items = value.slice(1, -1).split(',').map(item => {
            let cleanItem = item.trim().replace(/^["']|["']$/g, '');
            // Remove Obsidian syntax from array items
            cleanItem = removeObsidianSyntax(cleanItem);
            return cleanItem;
          }).filter(Boolean);

          if (key === 'genres' || key === 'genre') {
            parsedFrontmatter.genres = items;
          } else if (key === 'tags' || key === 'tag') {
            parsedFrontmatter.tags = items;
          }
          continue;
        }

        // Map field names to properties (case-insensitive)
        switch (key) {
          case 'title':
            parsedFrontmatter.title = value;
            break;
          case 'type':
            const lowerValue = value.toLowerCase();
            if (['movie', 'tv', 'book', 'game'].includes(lowerValue)) {
              parsedFrontmatter.type = lowerValue as any;
            }
            break;
          case 'status':
            // Map old status values to new ones
            let normalizedStatus = value.toLowerCase();
            if (normalizedStatus === 'watching') normalizedStatus = 'in-progress';
            if (['in-progress', 'completed', 'planned'].includes(normalizedStatus)) {
              parsedFrontmatter.status = normalizedStatus as any;
            }
            break;
          case 'rating':
            parsedFrontmatter.rating = parseFloat(value);
            break;
          case 'started':
          case 'datestarted':
            parsedFrontmatter.started = normalizeDate(value);
            break;
          case 'completed':
          case 'datewatched':
            parsedFrontmatter.completed = normalizeDate(value);
            break;
          case 'released':
          case 'releasedate':
            parsedFrontmatter.released = normalizeDate(value);
            break;
          case 'poster':
          case 'imageurl':
          case 'image':
            parsedFrontmatter.poster = value;
            break;
          case 'description':
          case 'plot':
          case 'summary':
            // Use description field, or plot/summary if description doesn't exist
            if (!parsedFrontmatter.description) {
              parsedFrontmatter.description = value;
            }
            break;
          case 'length':
          case 'runtime':
          case 'duration':
            parsedFrontmatter.length = value;
            break;
          case 'featured':
            parsedFrontmatter.featured = value === 'true' || value === '1' || value === 'yes';
            break;
          case 'published':
            parsedFrontmatter.published = value === 'true' || value === '1' || value === 'yes';
            break;
        }
      }

      // Handle any remaining array that was being collected
      if (currentArrayKey && currentArray.length > 0) {
        const key = currentArrayKey.toLowerCase();
        if (key === 'genres' || key === 'genre') {
          parsedFrontmatter.genres = currentArray;
        } else if (key === 'tags' || key === 'tag') {
          parsedFrontmatter.tags = currentArray;
        }
      }

      // Update state with parsed data
      setFrontmatter({
        ...frontmatter,
        ...parsedFrontmatter,
        // Ensure arrays are initialized
        genres: parsedFrontmatter.genres || frontmatter.genres || [],
        tags: parsedFrontmatter.tags || frontmatter.tags || [],
      });

      // Remove Obsidian wiki-link syntax from content
      const cleanedContent = removeObsidianSyntax(contentStr.trim());
      setContent(cleanedContent);
      setUploadMessage('✅ File imported successfully!');

    } catch (err) {
      console.error('Error parsing markdown file:', err);
      setError('Failed to parse markdown file. Please check the format.');
    }
  };

  // Process a single file for batch import
  const processBatchFile = async (file: File): Promise<ImportResult> => {
    if (!file.name.endsWith('.md')) {
      return {
        filename: file.name,
        status: 'failed',
        error: 'Not a .md file',
      };
    }

    try {
      const text = await file.text();

      // Check if file has frontmatter
      const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
      const match = text.match(frontmatterRegex);

      if (!match) {
        return {
          filename: file.name,
          status: 'bad-frontmatter',
          error: 'No frontmatter found',
        };
      }

      const [, frontmatterStr, contentStr] = match;
      const parsedFrontmatter: Partial<MediaFrontmatter> = {};
      let categoryValue: string | null = null; // Track category for type inference

      // Parse YAML frontmatter (same logic as parseMarkdownFile)
      const lines = frontmatterStr.split('\n');
      let currentArrayKey: string | null = null;
      let currentArray: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('-')) {
          const item = line.trim().substring(1).trim();
          let cleanItem = item.replace(/^["']|["']$/g, '');
          cleanItem = removeObsidianSyntax(cleanItem);
          currentArray.push(cleanItem);
          continue;
        }

        if (currentArrayKey && currentArray.length > 0) {
          const key = currentArrayKey.toLowerCase();
          if (key === 'genres' || key === 'genre') {
            parsedFrontmatter.genres = currentArray;
          } else if (key === 'tags' || key === 'tag') {
            parsedFrontmatter.tags = currentArray;
          }
          currentArrayKey = null;
          currentArray = [];
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim().toLowerCase();
        let value = line.substring(colonIndex + 1).trim();

        if (!value) {
          if (key === 'genres' || key === 'genre' || key === 'tags' || key === 'tag') {
            currentArrayKey = key;
            currentArray = [];
          }
          continue;
        }

        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        value = removeObsidianSyntax(value);

        if (value.startsWith('[') && value.endsWith(']')) {
          const items = value.slice(1, -1).split(',').map(item => {
            let cleanItem = item.trim().replace(/^["']|["']$/g, '');
            cleanItem = removeObsidianSyntax(cleanItem);
            return cleanItem;
          }).filter(Boolean);

          if (key === 'genres' || key === 'genre') {
            parsedFrontmatter.genres = items;
          } else if (key === 'tags' || key === 'tag') {
            parsedFrontmatter.tags = items;
          }
          continue;
        }

        switch (key) {
          case 'title':
            parsedFrontmatter.title = value;
            break;
          case 'type':
            const lowerValue = value.toLowerCase();
            if (['movie', 'tv', 'book', 'game'].includes(lowerValue)) {
              parsedFrontmatter.type = lowerValue as any;
            }
            break;
          case 'category':
            categoryValue = value; // Store category for potential type inference
            break;
          case 'status':
            let normalizedStatus = value.toLowerCase();
            if (normalizedStatus === 'watching') normalizedStatus = 'in-progress';
            if (['in-progress', 'completed', 'planned'].includes(normalizedStatus)) {
              parsedFrontmatter.status = normalizedStatus as any;
            }
            break;
          case 'rating':
            parsedFrontmatter.rating = parseFloat(value);
            break;
          case 'started':
          case 'datestarted':
            parsedFrontmatter.started = normalizeDate(value);
            break;
          case 'completed':
          case 'datewatched':
            parsedFrontmatter.completed = normalizeDate(value);
            break;
          case 'released':
          case 'releasedate':
            parsedFrontmatter.released = normalizeDate(value);
            break;
          case 'poster':
          case 'imageurl':
          case 'image':
            parsedFrontmatter.poster = value;
            break;
          case 'description':
          case 'plot':
          case 'summary':
            // Use description field, or plot/summary if description doesn't exist
            if (!parsedFrontmatter.description) {
              parsedFrontmatter.description = value;
            }
            break;
          case 'length':
          case 'runtime':
          case 'duration':
            parsedFrontmatter.length = value;
            break;
          case 'featured':
            parsedFrontmatter.featured = value === 'true' || value === '1' || value === 'yes';
            break;
          case 'published':
            parsedFrontmatter.published = value === 'true' || value === '1' || value === 'yes';
            break;
        }
      }

      if (currentArrayKey && currentArray.length > 0) {
        const key = currentArrayKey.toLowerCase();
        if (key === 'genres' || key === 'genre') {
          parsedFrontmatter.genres = currentArray;
        } else if (key === 'tags' || key === 'tag') {
          parsedFrontmatter.tags = currentArray;
        }
      }

      // Handle missing title - use filename without .md extension
      if (!parsedFrontmatter.title) {
        const filenameWithoutExt = file.name.replace(/\.md$/, '');
        parsedFrontmatter.title = filenameWithoutExt;
      }

      // Handle missing type - infer from category field
      if (!parsedFrontmatter.type && categoryValue) {
        const normalizedCategory = categoryValue.toLowerCase().trim();
        // Map category values to valid types
        if (['movie', 'tv', 'book', 'game'].includes(normalizedCategory)) {
          parsedFrontmatter.type = normalizedCategory as any;
        } else if (normalizedCategory === 'television' || normalizedCategory === 'series' || normalizedCategory === 'show') {
          parsedFrontmatter.type = 'tv';
        } else if (normalizedCategory === 'film' || normalizedCategory === 'movies') {
          parsedFrontmatter.type = 'movie';
        } else if (normalizedCategory === 'books' || normalizedCategory === 'novel' || normalizedCategory === 'reading') {
          parsedFrontmatter.type = 'book';
        } else if (normalizedCategory === 'games' || normalizedCategory === 'gaming' || normalizedCategory === 'video game' || normalizedCategory === 'video_games') {
          parsedFrontmatter.type = 'game';
        }
      }

      // If type still not set, try to infer from tags
      if (!parsedFrontmatter.type && parsedFrontmatter.tags && parsedFrontmatter.tags.length > 0) {
        for (const tag of parsedFrontmatter.tags) {
          const normalizedTag = tag.toLowerCase().trim();

          // Check if tag matches valid types or their aliases
          if (['movie', 'film', 'movies'].includes(normalizedTag)) {
            parsedFrontmatter.type = 'movie';
            break;
          } else if (['tv', 'television', 'series', 'show'].includes(normalizedTag)) {
            parsedFrontmatter.type = 'tv';
            break;
          } else if (['book', 'books', 'novel', 'reading'].includes(normalizedTag)) {
            parsedFrontmatter.type = 'book';
            break;
          } else if (['game', 'games', 'gaming', 'video game', 'video_games'].includes(normalizedTag)) {
            parsedFrontmatter.type = 'game';
            break;
          }
        }
      }

      // Auto-set status to "completed" if completed date exists
      if (parsedFrontmatter.completed) {
        parsedFrontmatter.status = 'completed';
      }

      // Validate required fields (after attempting to fill missing ones)
      if (!parsedFrontmatter.title || !parsedFrontmatter.type) {
        const missingFields = [];
        if (!parsedFrontmatter.title) missingFields.push('title');
        if (!parsedFrontmatter.type) missingFields.push('type');

        return {
          filename: file.name,
          status: 'bad-frontmatter',
          error: `Missing required fields: ${missingFields.join(', ')}. Could not infer from available data.`,
        };
      }

      // Create media entry via API
      const cleanedContent = removeObsidianSyntax(contentStr.trim());

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontmatter: {
            ...parsedFrontmatter,
            genres: parsedFrontmatter.genres || [],
            tags: parsedFrontmatter.tags || [],
            status: parsedFrontmatter.status || 'planned',
            featured: parsedFrontmatter.featured || false,
            published: parsedFrontmatter.published !== false, // Default to true
          },
          content: cleanedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          filename: file.name,
          status: 'failed',
          error: data.error || 'Failed to create media entry',
        };
      }

      return {
        filename: file.name,
        status: 'success',
        slug: data.slug,
        path: data.path,
      };
    } catch (err) {
      console.error('Error processing file:', err);
      return {
        filename: file.name,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  };

  // Handle batch import
  const handleBatchImport = async (files: File[]) => {
    setIsImporting(true);
    setIsBatchMode(true);
    setImportResults([]);
    setError(null);

    const results: ImportResult[] = [];

    for (const file of files) {
      const result = await processBatchFile(file);
      results.push(result);
      // Update results incrementally so user can see progress
      setImportResults([...results]);
    }

    setIsImporting(false);

    // Refresh the page to show new media entries
    router.refresh();
  };

  // Handle file selection
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    // Filter for .md files
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
      setError('Please upload .md (Markdown) files');
      return;
    }

    // If multiple files, use batch import
    if (mdFiles.length > 1) {
      handleBatchImport(mdFiles);
      return;
    }

    // Single file - use existing single file import logic
    const file = mdFiles[0];
    try {
      const text = await file.text();
      parseMarkdownFile(text);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file');
    }
  };

  // Handle drag events
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadMessage(null);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadMessage(null);

    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Markdown toolbar functions
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const addGenre = () => {
    if (genreInput.trim() && !frontmatter.genres?.includes(genreInput.trim())) {
      setFrontmatter({
        ...frontmatter,
        genres: [...(frontmatter.genres || []), genreInput.trim()],
      });
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setFrontmatter({
      ...frontmatter,
      genres: frontmatter.genres?.filter((g) => g !== genre),
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !frontmatter.tags?.includes(tagInput.trim())) {
      setFrontmatter({
        ...frontmatter,
        tags: [...(frontmatter.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFrontmatter({
      ...frontmatter,
      tags: frontmatter.tags?.filter((t) => t !== tag),
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const endpoint =
        mode === 'create'
          ? '/api/media'
          : `/api/media/${existingType}/${existingSlug}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontmatter,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save media file');
      }

      // Redirect to the media detail page
      router.push(data.path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {uploadMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
          {uploadMessage}
        </div>
      )}

      {/* File Upload Section - Only show in create mode */}
      {mode === 'create' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Markdown File</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".md"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop a markdown file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click "Choose File" above to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports .md files with frontmatter. Select multiple files for batch import.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Import Results */}
      {isBatchMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Results</h3>
                {isImporting && (
                  <span className="text-sm text-muted-foreground">Processing...</span>
                )}
                {!isImporting && importResults.length > 0 && (
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {importResults.filter(r => r.status === 'success').length} success
                    </span>
                    {' | '}
                    <span className="text-red-600 font-medium">
                      {importResults.filter(r => r.status === 'failed').length} failed
                    </span>
                    {' | '}
                    <span className="text-yellow-600 font-medium">
                      {importResults.filter(r => r.status === 'bad-frontmatter').length} bad frontmatter
                    </span>
                  </div>
                )}
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {importResults.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border
                      ${result.status === 'success' ? 'bg-green-500/5 border-green-500/20' : ''}
                      ${result.status === 'failed' ? 'bg-red-500/5 border-red-500/20' : ''}
                      ${result.status === 'bad-frontmatter' ? 'bg-yellow-500/5 border-yellow-500/20' : ''}
                    `}
                  >
                    {result.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    {result.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    {result.status === 'bad-frontmatter' && (
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.filename}</p>
                      {result.error && (
                        <p className="text-xs text-muted-foreground mt-1">{result.error}</p>
                      )}
                      {result.path && (
                        <a
                          href={result.path}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          View entry →
                        </a>
                      )}
                    </div>

                    {result.status === 'success' && (
                      <Badge variant="secondary" className="bg-green-600/10 text-green-700">
                        Success
                      </Badge>
                    )}
                    {result.status === 'failed' && (
                      <Badge variant="secondary" className="bg-red-600/10 text-red-700">
                        Failed
                      </Badge>
                    )}
                    {result.status === 'bad-frontmatter' && (
                      <Badge variant="secondary" className="bg-yellow-600/10 text-yellow-700">
                        Bad Frontmatter
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {!isImporting && importResults.length > 0 && (
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBatchMode(false);
                      setImportResults([]);
                    }}
                  >
                    Import More Files
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => router.push('/media')}
                  >
                    View Media Library
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show edit form when not in batch mode */}
      {!isBatchMode && (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {/* Front Matter Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Metadata</h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={frontmatter.title}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, title: e.target.value })
                    }
                    required
                    placeholder="Enter title"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={frontmatter.type}
                    onValueChange={(value: 'movie' | 'tv' | 'book' | 'game') =>
                      setFrontmatter({ ...frontmatter, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="tv">TV Show</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="game">Video Game</SelectItem>
                    </SelectContent>
                  </Select>
                  {mode === 'edit' && frontmatter.type !== existingType && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ Changing type will update the URL. Old links will no longer work.
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={frontmatter.status}
                    onValueChange={(value: 'in-progress' | 'completed' | 'planned') =>
                      setFrontmatter({ ...frontmatter, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={frontmatter.rating || ''}
                    onChange={(e) =>
                      setFrontmatter({
                        ...frontmatter,
                        rating: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                {/* Length */}
                <div className="space-y-2">
                  <Label htmlFor="length">
                    {frontmatter.type === 'movie' ? 'Runtime' :
                     frontmatter.type === 'tv' ? 'Episodes' :
                     frontmatter.type === 'book' ? 'Pages' :
                     'Playtime'}
                  </Label>
                  <Input
                    id="length"
                    value={frontmatter.length || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, length: e.target.value })
                    }
                    placeholder={
                      frontmatter.type === 'movie' ? '2h 30m' :
                      frontmatter.type === 'tv' ? '24 episodes' :
                      frontmatter.type === 'book' ? '350 pages' :
                      '40 hours'
                    }
                  />
                </div>

                {/* Release Date */}
                <div className="space-y-2">
                  <Label htmlFor="released">Release Date</Label>
                  <Input
                    id="released"
                    type="date"
                    value={frontmatter.released || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, released: e.target.value })
                    }
                  />
                </div>

                {/* Started Date */}
                <div className="space-y-2">
                  <Label htmlFor="started">Date Started</Label>
                  <Input
                    id="started"
                    type="date"
                    value={frontmatter.started || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, started: e.target.value })
                    }
                  />
                </div>

                {/* Completed Date */}
                <div className="space-y-2">
                  <Label htmlFor="completed">Date Completed</Label>
                  <Input
                    id="completed"
                    type="date"
                    value={frontmatter.completed || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, completed: e.target.value })
                    }
                  />
                </div>

                {/* Poster URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="poster">Poster/Cover Image URL</Label>
                  <Input
                    id="poster"
                    type="url"
                    value={frontmatter.poster || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, poster: e.target.value })
                    }
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={frontmatter.description || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, description: e.target.value })
                    }
                    placeholder="Short description or plot summary..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Genres */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="genres">Genres</Label>
                  <div className="flex gap-2">
                    <Input
                      id="genres"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      placeholder="Enter genre"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addGenre();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addGenre}
                      disabled={!genreInput.trim()}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {frontmatter.genres?.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter custom tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {frontmatter.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Featured & Published */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={frontmatter.featured}
                      onCheckedChange={(checked) =>
                        setFrontmatter({ ...frontmatter, featured: checked === true })
                      }
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Featured (show on homepage)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="published"
                      checked={frontmatter.published}
                      onCheckedChange={(checked) =>
                        setFrontmatter({ ...frontmatter, published: checked === true })
                      }
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Published (visible to public)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Markdown Editor Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('# ')}
                  >
                    H1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('## ')}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('**', '**')}
                  >
                    Bold
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('*', '*')}
                  >
                    Italic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('- ')}
                  >
                    List
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('[', '](url)')}
                  >
                    Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('```\n', '\n```')}
                  >
                    Code
                  </Button>
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content in Markdown..."
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <MarkdownPreview frontmatter={frontmatter} content={content} />
        </TabsContent>
      </Tabs>
      )}

      {/* Action Buttons - Only show when not in batch mode */}
      {!isBatchMode && (
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !frontmatter.title}>
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );
}
