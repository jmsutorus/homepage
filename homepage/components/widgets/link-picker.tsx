'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';

interface LinkItem {
  linkedType: "media" | "park" | "journal" | "activity";
  linkedId: number;
  linkedSlug?: string;
}

interface LinkPickerProps {
  links: LinkItem[];
  onLinksChange: (links: LinkItem[]) => void;
}

interface SearchResult {
  id: number;
  slug: string;
  title: string;
  type?: string;
}

export function LinkPicker({ links, onLinksChange }: LinkPickerProps) {
  const [selectedType, setSelectedType] = useState<"media" | "park" | "journal" | "activity">("media");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkedItemDetails, setLinkedItemDetails] = useState<Map<string, SearchResult>>(new Map());

  // Fetch details for linked items
  useEffect(() => {
    const fetchLinkedDetails = async () => {
      for (const link of links) {
        const key = `${link.linkedType}-${link.linkedId}`;
        if (!linkedItemDetails.has(key)) {
          try {
            let endpoint = '';
            if (link.linkedType === 'media' && link.linkedSlug) {
              // Media has type in URL
              const type = link.linkedSlug.split('/')[0] || 'movie';
              endpoint = `/api/media/${type}/${link.linkedSlug.split('/')[1]}`;
            } else if (link.linkedSlug) {
              endpoint = `/api/${link.linkedType}s/${link.linkedSlug}`;
            }

            if (endpoint) {
              const res = await fetch(endpoint);
              if (res.ok) {
                const data = await res.json();
                setLinkedItemDetails(prev => new Map(prev).set(key, {
                  id: link.linkedId,
                  slug: data.slug,
                  title: data.frontmatter?.title || data.title || 'Unknown',
                  type: link.linkedType,
                }));
              }
            }
          } catch (error) {
            console.error('Error fetching linked item details:', error);
          }
        }
      }
    };

    fetchLinkedDetails();
  }, [links]);

  // Search for items to link
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let endpoint = '';
      switch (selectedType) {
        case 'media':
          endpoint = '/api/media';
          break;
        case 'park':
          endpoint = '/api/parks';
          break;
        case 'journal':
          endpoint = '/api/journals';
          break;
        case 'activity':
          // For activities, we'll need to implement this endpoint
          endpoint = '/api/activities';
          break;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();

        // Filter results based on search query
        const filtered = data.filter((item: any) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filtered.map((item: any) => ({
          id: item.id,
          slug: item.slug || `${item.type}/${item.slug}`,
          title: item.title || item.name,
          type: item.type,
        })));
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addLink = (result: SearchResult) => {
    const newLink: LinkItem = {
      linkedType: selectedType,
      linkedId: result.id,
      linkedSlug: result.slug,
    };

    // Check if already linked
    const exists = links.some(
      l => l.linkedType === newLink.linkedType && l.linkedId === newLink.linkedId
    );

    if (!exists) {
      onLinksChange([...links, newLink]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeLink = (linkedType: string, linkedId: number) => {
    onLinksChange(links.filter(l => !(l.linkedType === linkedType && l.linkedId === linkedId)));
  };

  return (
    <div className="space-y-4">
      {/* Current Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label>Current Links ({links.length})</Label>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => {
              const key = `${link.linkedType}-${link.linkedId}`;
              const details = linkedItemDetails.get(key);
              return (
                <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize">{link.linkedType}:</span>
                  <span>{details?.title || link.linkedSlug || `ID ${link.linkedId}`}</span>
                  <button
                    type="button"
                    onClick={() => removeLink(link.linkedType, link.linkedId)}
                    className="cursor-pointer hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Link */}
      <div className="border rounded-lg p-4 space-y-4">
        <Label>Add Link</Label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="link-type">Type</Label>
            <Select value={selectedType} onValueChange={(val: any) => setSelectedType(val)}>
              <SelectTrigger id="link-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="park">Park</SelectItem>
                <SelectItem value="journal">Journal</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for ${selectedType}...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Results</Label>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => addLink(result)}
                >
                  <div>
                    <p className="font-medium">{result.title}</p>
                    {result.type && (
                      <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                    )}
                  </div>
                  <Button type="button" size="icon" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <p className="text-sm text-muted-foreground">No results found</p>
        )}
      </div>
    </div>
  );
}
