'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DBParkCategory, ParkCategoryValue, PARK_CATEGORIES } from '@/lib/db/enums/park-enums';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Plus
} from 'lucide-react';
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
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';

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
  quote?: string;
}

interface ParkEditorialEditorProps {
  initialFrontmatter?: ParkFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function ParkEditorialEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingSlug,
}: ParkEditorialEditorProps) {
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
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);


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
            parsedFrontmatter.poster = value;
            break;
          case 'description':
          case 'summary':
            parsedFrontmatter.description = value;
            break;
          case 'visited':
          case 'date':
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
          case 'quote':
          case 'mantra':
            parsedFrontmatter.quote = value;
            break;
        }
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
    const file = mdFiles[0];
    try {
      const text = await file.text();
      parseMarkdownFile(text, file.name);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file');
    }
  };

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSaving(true);
    setUploadMessage(null);

    try {
      const endpoint = mode === 'create' ? '/api/parks' : `/api/parks/${existingSlug}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontmatter, content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save park');

      if (mode === 'create') {
        showCreationSuccess('park', { persistent: true });
        setSavedPath(data.path);
        setShowSuccess(true);
      } else {
        router.push(data.path);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('park', err);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSlug) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/parks/${existingSlug}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete park');
      }
      router.push('/parks');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('park', err);
      setIsSaving(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    return (
      <div className="space-y-1 py-1">
        {[0, 5].map((row) => (
          <div key={row} className="flex gap-1 text-media-secondary">
            {[1, 2, 3, 4, 5].map((idx) => {
              const star = row + idx;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star === value ? star - 1 : star)}
                  className="cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <span 
                    className="material-symbols-outlined text-xl" 
                    style={{ fontVariationSettings: `'FILL' ${star <= value ? 1 : 0}` }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <main className="min-h-screen text-media-primary selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed font-lexend pb-32">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".md"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length > 0) handleFileSelect(files);
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-12">
        {/* Editorial Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-media-secondary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">
              {mode === 'create' ? 'New Discovery' : 'Editorial Reflection'}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-media-primary tracking-tighter leading-none">
              {mode === 'create' ? (
                <>Record a New <span className="italic font-light">Discovery</span></>
              ) : (
                <>Refine Your <span className="italic font-light">Journey</span></>
              )}
            </h1>
            <p className="mt-6 text-media-on-surface-variant text-lg leading-relaxed font-light">
              {mode === 'create' 
                ? "Document your explorations through the wild. Every park has a story; every visit is a chapter in your personal journal."
                : `Updating your chronicles for ${frontmatter.title || 'this sacred space'}. Your memories preserve the essence of the wilderness.`
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer group flex items-center gap-2 px-6 py-3 bg-media-primary-fixed text-media-on-primary-fixed rounded-lg font-medium hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Import Markdown
            </button>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4 mb-8">
          {error && (
            <div className="bg-media-error-container/20 border border-media-error text-media-error px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="cursor-pointer ml-auto opacity-50 hover:opacity-100 transition-opacity">
                 <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {uploadMessage && (
            <div className="bg-media-primary-container/20 border border-media-primary text-media-primary px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">{uploadMessage}</p>
              <button onClick={() => setUploadMessage(null)} className="cursor-pointer ml-auto opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Identity & Identity Image */}
          <div className="md:col-span-4 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Park Identity</h2>
                <div className="flex gap-2">
                   <Checkbox 
                    id="featured" 
                    checked={frontmatter.featured} 
                    onCheckedChange={(checked) => setFrontmatter(prev => ({ ...prev, featured: checked === true }))}
                    className="border-media-outline-variant data-[state=checked]:bg-media-secondary data-[state=checked]:border-media-secondary"
                   />
                   <Label htmlFor="featured" className="text-[10px] uppercase font-bold tracking-widest text-media-on-surface-variant cursor-pointer">Featured</Label>
                </div>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Park Name</label>
                  <input 
                    type="text"
                    required
                    value={frontmatter.title}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant text-lg font-medium" 
                    placeholder="e.g. Sequoia National Park" 
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Category</label>
                  <Select 
                    value={frontmatter.category} 
                    onValueChange={(val: ParkCategoryValue) => setFrontmatter(prev => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger className="w-full bg-media-surface-container-low border-none rounded-lg p-6 h-auto focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-low border-media-outline-variant/10">
                      {PARK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="focus:bg-media-secondary/10 transition-colors cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">State / Region</label>
                  <input 
                    type="text"
                    value={frontmatter.state || ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="California, USA" 
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Mantra / Quote</label>
                  <textarea 
                    value={frontmatter.quote || ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, quote: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant italic font-light resize-none min-h-[80px]" 
                    placeholder="Set the defining spirit..." 
                  />
                </div>
              </div>
            </section>

            {/* Visual Element / Poster Preview */}
            <div 
              className="relative group hidden md:block overflow-hidden rounded-xl bg-media-surface-container border border-media-outline-variant/10 shadow-xl cursor-pointer aspect-[3/4]"
              onClick={() => {
                const url = prompt('Enter Hero Photo URL:', frontmatter.poster);
                if (url !== null) setFrontmatter(prev => ({ ...prev, poster: url }));
              }}
            >
              {frontmatter.poster ? (
                <Image 
                  src={frontmatter.poster} 
                  alt="Park Preview" 
                  fill
                  className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-media-on-surface-variant/30">
                  <ImageIcon className="w-16 h-16 stroke-[1]" />
                  <span className="text-xs uppercase font-bold tracking-widest">No Visual Reference</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-media-primary/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-8 left-8 text-media-on-primary font-bold text-2xl tracking-tight">
                {frontmatter.poster ? 'Visual Reference' : 'Assign Placeholder'}
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
                   <Plus className="text-white w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Dangerous Actions */}
            {mode === 'edit' && (
              <section className="pt-12 border-t border-media-outline-variant/10">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button type="button" className="cursor-pointer flex items-center gap-2 text-media-error opacity-40 hover:opacity-100 transition-opacity font-bold uppercase tracking-widest text-[10px]">
                      <Trash2 className="w-4 h-4" />
                      Deconstruct Narrative
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-media-surface-container-lowest border-media-error/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-media-primary">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-media-on-surface-variant">
                        This action will permanently remove this discovery from your journal. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-media-surface-container-low border-none rounded-lg">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-media-error text-white hover:bg-media-error/90 rounded-lg">
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </section>
            )}
          </div>

          {/* Right Column: The Narrative & Metadata */}
          <div className="md:col-span-8 bg-media-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-[0_24px_80px_rgba(6,27,14,0.03)] border border-media-outline-variant/5 space-y-12">
            {/* Metadata Grid */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Your Journey</h2>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <label className="block text-[9px] uppercase font-black tracking-widest text-media-secondary/60 mb-1 mr-1">Merit / Rating</label>
                      <StarRating 
                        value={frontmatter.rating || 0} 
                        onChange={(val) => setFrontmatter(prev => ({ ...prev, rating: val }))} 
                      />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Date Visited</label>
                  <input 
                    type="date"
                    value={frontmatter.visited || ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, visited: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium" 
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Hero Photo URL</label>
                  <input 
                    type="url"
                    value={frontmatter.poster || ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, poster: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="https://unsplash.com/..." 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-1 ml-1">Descriptors (Tags)</label>
                <TagInput
                  selectedTags={frontmatter.tags || []}
                  onTagsChange={(tags) => setFrontmatter(prev => ({ ...prev, tags }))}
                  placeholder="Enter tag (e.g., hiking, wilderness) or search existing..."
                  className="bg-media-surface-container-low border-none rounded-lg p-4"
                />
              </div>
            </section>

            {/* Mobile Toggle for Content Section */}
            <div className="md:hidden">
              <button 
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                  setIsContentExpanded(!isContentExpanded);
                }}
                className="w-full py-4 bg-media-surface-container-low rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-media-primary hover:bg-media-surface-container-high transition-colors shadow-sm border border-media-outline-variant/10 mb-6"
              >
                <span className="material-symbols-outlined">
                  {isContentExpanded ? 'expand_less' : 'expand_more'}
                </span>
                {isContentExpanded ? 'Collapse Narrative Section' : 'Expand Narrative Section'}
              </button>
            </div>

            {/* Narrative / Content Area */}
            <section className={`space-y-8 flex flex-col md:h-full ${!isContentExpanded ? 'hidden md:flex' : ''}`}>
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">The Narrative</h2>
                <div className="flex items-center gap-1">
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('# ')} 
                    className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-media-surface-container-low text-media-on-surface-variant transition-colors"
                    title="Heading 1"
                  >
                    <span className="material-symbols-outlined text-xl">format_h1</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('## ')} 
                    className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-media-surface-container-low text-media-on-surface-variant transition-colors"
                    title="Heading 2"
                  >
                    <span className="material-symbols-outlined text-xl">format_h2</span>
                  </button>
                  <div className="w-px h-5 bg-media-outline-variant/10 mx-2" />
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('**', '**')} 
                    className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-media-surface-container-low text-media-on-surface-variant transition-colors"
                    title="Bold"
                  >
                    <span className="material-symbols-outlined text-xl">format_bold</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('*', '*')} 
                    className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-media-surface-container-low text-media-on-surface-variant transition-colors"
                    title="Italic"
                  >
                    <span className="material-symbols-outlined text-xl">format_italic</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-1">
                <textarea 
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full flex-1 bg-transparent border-none focus:ring-0 p-0 text-xl leading-[1.8] text-media-on-surface-variant font-light resize-none placeholder:text-media-outline-variant/30 min-h-[250px] md:min-h-0" 
                  placeholder="Begin your story here... Describe the air, the sounds of the birds, and the path beneath your feet." 
                />
              </div>
            </section>

            <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-media-on-surface-variant text-sm font-light italic">Your entry will be saved to your local journal instantly.</p>
              <div className="flex items-center w-full md:w-auto">
                <button 
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                    setFrontmatter(prev => ({ ...prev, published: true }));
                    setTimeout(() => handleSave(), 0);
                  }}
                  disabled={isSaving || !frontmatter.title}
                  className="cursor-pointer w-full md:w-auto px-10 py-4 bg-media-secondary text-media-on-secondary rounded-lg font-bold shadow-lg shadow-media-secondary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? 'Preserving...' : (mode === 'create' ? 'Publish to Journal' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <SuccessOverlay 
        show={showSuccess} 
        onComplete={() => {
          if (savedPath) {
            router.push(savedPath);
            router.refresh();
          }
        }} 
      />
    </main>
  );
}
