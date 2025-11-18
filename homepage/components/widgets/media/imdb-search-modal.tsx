'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';

export interface IMDBMediaData {
  title: string;
  type: 'movie' | 'tv';
  rating?: number;
  released?: string;
  genres?: string[];
  poster?: string;
  description?: string;
  length?: string;
  creator?: string[];
}

interface IMDBSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaSelect: (data: IMDBMediaData) => void;
}

export function IMDBSearchModal({
  open,
  onOpenChange,
  onMediaSelect,
}: IMDBSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a movie/TV show name or IMDB ID');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/imdb/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media data');
      }

      // Pass the data to the parent component
      onMediaSelect(data);

      // Close modal and reset
      onOpenChange(false);
      setSearchQuery('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search IMDB');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search IMDB</DialogTitle>
          <DialogDescription>
            Enter a movie/TV show name or IMDB ID (e.g., "Inception" or "tt1375666")
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="search">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter title or IMDB ID..."
                disabled={isSearching}
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: For best results, use the exact IMDB ID (starts with "tt")
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
