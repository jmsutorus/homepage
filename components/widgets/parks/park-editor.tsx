'use client';

import { useState, useRef, FormEvent } from 'react';
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
import { DBParkCategory, ParkCategoryValue, PARK_CATEGORIES } from '@/lib/db/enums/park-enums';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ParkFrontmatter {
  title: string;
  category: ParkCategoryValue;
  state?: string;
  poster?: string;
  description?: string;
  visited?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  published?: boolean;
}

interface ParkEditorProps {
  initialFrontmatter?: ParkFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function ParkEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingSlug,
}: ParkEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [frontmatter, setFrontmatter] = useState<ParkFrontmatter>(
    initialFrontmatter || {
      title: '',
      category: DBParkCategory.NationalPark,
      tags: [],
      featured: false,
      published: true,
    }
  );
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Helper function to convert ISO date to YYYY-MM-DD format
  const normalizeDate = (dateString: string): string => {
    try {
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Helper function to remove Obsidian wiki-link syntax
  const removeObsidianSyntax = (text: string): string => {
    return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, alias) => {
      return alias || link;
    });
  };

  // Parse markdown file with frontmatter
  const parseMarkdownFile = (fileContent: string, filename: string) => {
    try {
      const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
      const match = fileContent.match(frontmatterRegex);

      if (!match) {
        const cleanedContent = removeObsidianSyntax(fileContent);
        setContent(cleanedContent);
        setUploadMessage('File imported (no frontmatter found)');
        
        // If title is empty, use filename
        if (!frontmatter.title) {
           const filenameWithoutExt = filename.replace(/\.md$/, '');
           setFrontmatter(prev => ({ ...prev, title: filenameWithoutExt }));
        }
        return;
      }

      const [, frontmatterStr, contentStr] = match;
      const parsedFrontmatter: Partial<ParkFrontmatter> = {};

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
          if (key === 'tags' || key === 'tag') {
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
          if (key === 'tags' || key === 'tag') {
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

          if (key === 'tags' || key === 'tag') {
            parsedFrontmatter.tags = items;
          }
          continue;
        }

        switch (key) {
          case 'title':
            parsedFrontmatter.title = value;
            break;
          case 'category':
             // Try to match with existing categories
             const normalizedCategory = value.trim();
             if (PARK_CATEGORIES.includes(normalizedCategory as any)) {
                 parsedFrontmatter.category = normalizedCategory as ParkCategoryValue;
             }
             break;
          case 'state':
          case 'location':
            parsedFrontmatter.state = value;
            break;
          case 'poster':
          case 'image':
          case 'imageurl':
            parsedFrontmatter.poster = value;
            break;
          case 'description':
          case 'summary':
            parsedFrontmatter.description = value;
            break;
          case 'visited':
          case 'date':
          case 'datevisited':
            parsedFrontmatter.visited = normalizeDate(value);
            break;
          case 'rating':
            parsedFrontmatter.rating = parseFloat(value);
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
        if (key === 'tags' || key === 'tag') {
          parsedFrontmatter.tags = currentArray;
        }
      }

      // If title is missing, use filename
      if (!parsedFrontmatter.title && !frontmatter.title) {
        const filenameWithoutExt = filename.replace(/\.md$/, '');
        parsedFrontmatter.title = filenameWithoutExt;
      }

      setFrontmatter({
        ...frontmatter,
        ...parsedFrontmatter,
        tags: parsedFrontmatter.tags || frontmatter.tags || [],
      });

      const cleanedContent = removeObsidianSyntax(contentStr.trim());
      setContent(cleanedContent);
      setUploadMessage('✅ File imported successfully!');
      setError(null);

    } catch (err) {
      console.error('Error parsing markdown file:', err);
      setError('Failed to parse markdown file. Please check the format.');
    }
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
      setError('Please upload .md (Markdown) files');
      return;
    }

    // Only handle single file for now as per requirement "Add New Park page" (singular)
    const file = mdFiles[0];
    try {
      const text = await file.text();
      parseMarkdownFile(text, file.name);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadMessage(null);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

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

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };


  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const endpoint =
        mode === 'create'
          ? '/api/parks'
          : `/api/parks/${existingSlug}`;
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
        throw new Error(data.error || 'Failed to save park');
      }

      // Show persistent success toast for create mode
      if (mode === 'create') {
        showCreationSuccess('park', { persistent: true });
      }

      // Redirect to the park detail page
      router.push(data.path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('park', err);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSlug) return;

    setIsSaving(true); // Reuse existing saving state
    setError(null);

    try {
      const response = await fetch(`/api/parks/${existingSlug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete park');
      }

      // Redirect to parks list on success
      router.push('/parks');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('park', err);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {uploadMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {uploadMessage}
        </div>
      )}

      {/* Drag and Drop Zone */}
      {mode === 'create' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold">Import from Markdown</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Drag and drop a .md file here to auto-fill the form, or click to browse.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Select File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".md"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      )}

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="cursor-pointer">Edit</TabsTrigger>
          <TabsTrigger value="preview" className="cursor-pointer">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {/* Front Matter Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Park Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Park Name *</Label>
                  <Input
                    id="title"
                    value={frontmatter.title}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, title: e.target.value })
                    }
                    required
                    placeholder="Enter park name"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={frontmatter.category}
                    onValueChange={(value: ParkCategoryValue) =>
                      setFrontmatter({ ...frontmatter, category: value })
                    }
                  >
                    <SelectTrigger id="category" className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARK_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="cursor-pointer">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={frontmatter.state || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, state: e.target.value })
                    }
                    placeholder="e.g., California, CA"
                  />
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

                {/* Visited Date */}
                <div className="space-y-2">
                  <Label htmlFor="visited">Date Visited</Label>
                  <Input
                    id="visited"
                    type="date"
                    value={frontmatter.visited || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, visited: e.target.value })
                    }
                  />
                </div>

                {/* Poster URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="poster">Photo URL</Label>
                  <Input
                    id="poster"
                    type="url"
                    value={frontmatter.poster || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, poster: e.target.value })
                    }
                    placeholder="https://example.com/park-photo.jpg"
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
                    placeholder="Short description of the park..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <TagInput
                    selectedTags={frontmatter.tags || []}
                    onTagsChange={(tags) =>
                      setFrontmatter({ ...frontmatter, tags })
                    }
                    placeholder="Enter tag (e.g., hiking, camping) or search existing..."
                  />
                </div>

                {/* Featured & Published */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      className="cursor-pointer"
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
                      className="cursor-pointer"
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
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your park visit in Markdown..."
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h1>{frontmatter.title || 'Untitled Park'}</h1>
                <div className="flex gap-2 items-center mb-4">
                  <Badge>{frontmatter.category}</Badge>
                  {frontmatter.state && <span className="text-muted-foreground">{frontmatter.state}</span>}
                  {frontmatter.rating && <span>★ {frontmatter.rating}/10</span>}
                </div>
                {frontmatter.description && <p className="lead">{frontmatter.description}</p>}
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        {/* Delete button - only in edit mode */}
        {mode === 'edit' && existingSlug && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this
                  park entry and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Cancel and Save buttons */}
        <div className="flex gap-4 ml-auto">
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
      </div>
    </form>
  );
}
