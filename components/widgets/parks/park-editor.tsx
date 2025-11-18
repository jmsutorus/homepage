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
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Redirect to the park detail page
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

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
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
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARK_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag (e.g., hiking, camping)"
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
                          className="cursor-pointer ml-2 hover:text-red-500"
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
    </form>
  );
}
