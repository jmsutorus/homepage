'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setSearchQuery('');
      setError(null);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a movie/TV show name or IMDB ID');
      return;
    }

    inputRef.current?.blur();

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

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

      setSearchResults(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search IMDB');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedia = async (media: any) => {
    if (media.rating !== undefined) {
      onMediaSelect(media);
      onOpenChange(false);
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
        body: JSON.stringify({ query: media.imdbId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media details');
      }

      onMediaSelect(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media details');
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
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col overflow-hidden border border-evergreen/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-evergreen/10 fixed top-[15%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%]">
        <div className="absolute top-0 right-0 -z-10 w-[200px] h-[200px] bg-evergreen/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[200px] h-[200px] bg-evergreen/5 blur-[100px] rounded-full pointer-events-none" />

        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-evergreen to-emerald-600 bg-clip-text text-transparent">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Search IMDB
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90 mt-1">
            Enter a movie/TV show name or IMDB ID (e.g., &quot;Inception&quot; or &quot;tt1375666&quot;)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex-shrink-0 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="search" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase pl-1">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by title or IMDB ID..."
                disabled={isSearching}
                autoFocus
                className="bg-secondary/40 border-evergreen/10 focus-visible:ring-evergreen/30 rounded-xl"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="cursor-pointer rounded-xl bg-evergreen hover:bg-evergreen-dark text-white shadow-lg shadow-evergreen/20 transition-all duration-200"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/60 pl-1">
              Tip: For best results, use the exact IMDB ID (starts with &quot;tt&quot;)
            </p>
          </div>

          {isSearching && (
            <div className="mt-6 space-y-3 flex-1">
              <div className="h-4 w-24 bg-evergreen/10 rounded animate-pulse mb-2" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-evergreen/5 bg-evergreen/5 items-center animate-pulse">
                  <div className="w-[50px] h-[70px] rounded-lg bg-evergreen/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-evergreen/10 rounded w-3/4" />
                    <div className="h-3 bg-evergreen/5 rounded w-1/2" />
                    <div className="h-3 bg-evergreen/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {searchResults.length > 0 && !isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mt-6 space-y-2 flex-1 overflow-hidden flex flex-col min-h-[250px]"
              >
                <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 flex-shrink-0 flex items-center gap-1.5 tracking-wide uppercase pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Search Results ({searchResults.length})
                </Label>
                
                <div className="grid gap-3 mt-2 overflow-y-auto overflow-x-hidden pr-3 flex-1 custom-scrollbar">
                  {searchResults.map((media, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(45, 77, 54, 0.08)' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectMedia(media)}
                      className="flex gap-4 p-3 rounded-xl border border-evergreen/10 bg-evergreen/5 hover:border-evergreen/30 cursor-pointer transition-all duration-200 group items-center backdrop-blur-sm"
                    >
                      {media.poster ? (
                        <div className="relative w-[50px] h-[70px] rounded-lg overflow-hidden flex-shrink-0 bg-muted shadow-md group-hover:shadow-evergreen/10 transition-shadow">
                          <img 
                            src={media.poster} 
                            alt={media.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="w-[50px] h-[70px] rounded-lg bg-evergreen/10 flex items-center justify-center flex-shrink-0 border border-evergreen/20">
                          <Search className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                          {media.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-semibold text-emerald-600/90 dark:text-emerald-400/90 bg-evergreen/10 border border-evergreen/20 px-2 py-0.5 rounded-full uppercase">
                            {media.type}
                          </span>
                          {media.released && (
                            <span className="text-[10px] font-semibold text-muted-foreground/80 bg-secondary/50 border border-border/10 px-2 py-0.5 rounded-full">
                              {media.released}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
